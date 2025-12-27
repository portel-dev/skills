/**
 * MCP Server Evaluation Harness (TypeScript)
 *
 * Evaluates MCP servers by running test questions against them using Claude.
 * Designed to work with NCP code-mode where MCPs are available as namespaces.
 *
 * Usage in NCP code-mode:
 *   const report = await runEvaluation('./evaluation.xml', myMcpNamespace);
 */

import Anthropic from '@anthropic-ai/sdk';

// Types
interface QAPair {
  question: string;
  answer: string;
}

interface ToolMetrics {
  [toolName: string]: {
    count: number;
    durations: number[];
  };
}

interface EvaluationResult {
  question: string;
  expected: string;
  actual: string | null;
  score: number;
  totalDuration: number;
  toolCalls: ToolMetrics;
  numToolCalls: number;
  summary: string | null;
  feedback: string | null;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface MCPNamespace {
  [methodName: string]: (params: Record<string, unknown>) => Promise<unknown>;
}

const EVALUATION_PROMPT = `You are an AI assistant with access to tools.

When given a task, you MUST:
1. Use the available tools to complete the task
2. Provide summary of each step in your approach, wrapped in <summary> tags
3. Provide feedback on the tools provided, wrapped in <feedback> tags
4. Provide your final response, wrapped in <response> tags

Summary Requirements:
- In your <summary> tags, explain the steps you took, which tools you used, and how you arrived at the response

Feedback Requirements:
- In your <feedback> tags, provide constructive feedback on tool names, parameters, and descriptions

Response Requirements:
- Your response should be concise and directly address what was asked
- Always wrap your final response in <response> tags
- If you cannot solve the task return <response>NOT_FOUND</response>
- For numeric responses, provide just the number
- Your response should go last`;

/**
 * Parse evaluation XML content
 */
export function parseEvaluationXml(xmlContent: string): QAPair[] {
  const evaluations: QAPair[] = [];

  // Simple XML parsing for qa_pair elements
  const qaPairRegex = /<qa_pair>([\s\S]*?)<\/qa_pair>/g;
  const questionRegex = /<question>([\s\S]*?)<\/question>/;
  const answerRegex = /<answer>([\s\S]*?)<\/answer>/;

  let match;
  while ((match = qaPairRegex.exec(xmlContent)) !== null) {
    const content = match[1];
    const questionMatch = questionRegex.exec(content);
    const answerMatch = answerRegex.exec(content);

    if (questionMatch && answerMatch) {
      evaluations.push({
        question: questionMatch[1].trim(),
        answer: answerMatch[1].trim(),
      });
    }
  }

  return evaluations;
}

/**
 * Extract content from XML-style tags in response
 */
function extractTagContent(text: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
  const matches = [...text.matchAll(regex)];
  return matches.length > 0 ? matches[matches.length - 1][1].trim() : null;
}

/**
 * Convert MCP namespace tools to Anthropic tool format
 */
export function convertToolsToAnthropicFormat(tools: MCPTool[]): Anthropic.Tool[] {
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
  }));
}

/**
 * Run agent loop with MCP tools
 */
async function agentLoop(
  client: Anthropic,
  model: string,
  question: string,
  tools: Anthropic.Tool[],
  mcpNamespace: MCPNamespace
): Promise<{ response: string; toolMetrics: ToolMetrics }> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question }
  ];

  const toolMetrics: ToolMetrics = {};

  let response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: EVALUATION_PROMPT,
    messages,
    tools,
  });

  messages.push({ role: 'assistant', content: response.content });

  while (response.stop_reason === 'tool_use') {
    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (!toolUse) break;

    const toolName = toolUse.name;
    const toolInput = toolUse.input as Record<string, unknown>;

    const startTime = Date.now();
    let toolResponse: string;

    try {
      // Extract method name from tool name (e.g., "mcp_list" -> "list")
      const methodName = toolName.includes('_')
        ? toolName.split('_').slice(1).join('_')
        : toolName;

      const method = mcpNamespace[methodName];
      if (typeof method === 'function') {
        const result = await method(toolInput);
        toolResponse = typeof result === 'object'
          ? JSON.stringify(result)
          : String(result);
      } else {
        toolResponse = `Error: Method ${methodName} not found in namespace`;
      }
    } catch (error) {
      toolResponse = `Error executing tool ${toolName}: ${error}`;
    }

    const duration = (Date.now() - startTime) / 1000;

    if (!toolMetrics[toolName]) {
      toolMetrics[toolName] = { count: 0, durations: [] };
    }
    toolMetrics[toolName].count++;
    toolMetrics[toolName].durations.push(duration);

    messages.push({
      role: 'user',
      content: [{
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: toolResponse,
      }],
    });

    response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: EVALUATION_PROMPT,
      messages,
      tools,
    });

    messages.push({ role: 'assistant', content: response.content });
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  return {
    response: textBlock?.text || '',
    toolMetrics,
  };
}

/**
 * Evaluate a single QA pair
 */
async function evaluateSingleTask(
  client: Anthropic,
  model: string,
  qaPair: QAPair,
  tools: Anthropic.Tool[],
  mcpNamespace: MCPNamespace,
  taskIndex: number
): Promise<EvaluationResult> {
  const startTime = Date.now();

  console.log(`Task ${taskIndex + 1}: ${qaPair.question.substring(0, 80)}...`);

  const { response, toolMetrics } = await agentLoop(
    client,
    model,
    qaPair.question,
    tools,
    mcpNamespace
  );

  const responseValue = extractTagContent(response, 'response');
  const summary = extractTagContent(response, 'summary');
  const feedback = extractTagContent(response, 'feedback');

  const durationSeconds = (Date.now() - startTime) / 1000;
  const numToolCalls = Object.values(toolMetrics)
    .reduce((sum, m) => sum + m.count, 0);

  return {
    question: qaPair.question,
    expected: qaPair.answer,
    actual: responseValue,
    score: responseValue === qaPair.answer ? 1 : 0,
    totalDuration: durationSeconds,
    toolCalls: toolMetrics,
    numToolCalls,
    summary,
    feedback,
  };
}

/**
 * Generate evaluation report
 */
function generateReport(results: EvaluationResult[]): string {
  const correct = results.reduce((sum, r) => sum + r.score, 0);
  const accuracy = results.length > 0 ? (correct / results.length) * 100 : 0;
  const avgDuration = results.length > 0
    ? results.reduce((sum, r) => sum + r.totalDuration, 0) / results.length
    : 0;
  const avgToolCalls = results.length > 0
    ? results.reduce((sum, r) => sum + r.numToolCalls, 0) / results.length
    : 0;
  const totalToolCalls = results.reduce((sum, r) => sum + r.numToolCalls, 0);

  let report = `# Evaluation Report

## Summary

- **Accuracy**: ${correct}/${results.length} (${accuracy.toFixed(1)}%)
- **Average Task Duration**: ${avgDuration.toFixed(2)}s
- **Average Tool Calls per Task**: ${avgToolCalls.toFixed(2)}
- **Total Tool Calls**: ${totalToolCalls}

---

`;

  results.forEach((result, i) => {
    report += `### Task ${i + 1}

**Question**: ${result.question}
**Expected**: \`${result.expected}\`
**Actual**: \`${result.actual || 'N/A'}\`
**Correct**: ${result.score ? '✅' : '❌'}
**Duration**: ${result.totalDuration.toFixed(2)}s
**Tool Calls**: ${result.numToolCalls}

**Summary**
${result.summary || 'N/A'}

**Feedback**
${result.feedback || 'N/A'}

---

`;
  });

  return report;
}

/**
 * Main evaluation function
 *
 * @param xmlContent - Evaluation XML content (or file path if running with fs access)
 * @param tools - Array of MCP tool definitions
 * @param mcpNamespace - MCP namespace object with callable methods
 * @param model - Claude model to use (default: claude-sonnet-4-20250514)
 * @returns Evaluation report as markdown string
 */
export async function runEvaluation(
  xmlContent: string,
  tools: MCPTool[],
  mcpNamespace: MCPNamespace,
  model: string = 'claude-sonnet-4-20250514'
): Promise<string> {
  console.log('🚀 Starting Evaluation');

  const client = new Anthropic();
  const anthropicTools = convertToolsToAnthropicFormat(tools);

  console.log(`📋 Loaded ${anthropicTools.length} tools`);

  const qaPairs = parseEvaluationXml(xmlContent);
  console.log(`📋 Loaded ${qaPairs.length} evaluation tasks`);

  const results: EvaluationResult[] = [];

  for (let i = 0; i < qaPairs.length; i++) {
    console.log(`Processing task ${i + 1}/${qaPairs.length}`);
    const result = await evaluateSingleTask(
      client,
      model,
      qaPairs[i],
      anthropicTools,
      mcpNamespace,
      i
    );
    results.push(result);
  }

  const report = generateReport(results);
  console.log('✅ Evaluation complete');

  return report;
}

// Export for use in NCP code-mode
export default { runEvaluation, parseEvaluationXml, convertToolsToAnthropicFormat };
