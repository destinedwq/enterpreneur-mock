import { GoogleGenAI } from "@google/genai";
import { StartupData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const validateIdea = async (data: Partial<StartupData>) => {
  const model = "gemini-3.1-flash-lite-preview";
  const prompt = `
    你是一位资深的创业导师和投资人。请评估以下创业想法：
    想法名称/描述: ${data.idea}
    目标受众: ${data.targetAudience}
    解决的问题: ${data.problemSolved}

    请从市场潜力、可行性、竞争优势三个维度进行打分（总分100），并提供详细的反馈和改进建议。
    请以 JSON 格式返回，格式如下：
    {
      "score": 85,
      "feedback": "详细的反馈内容...",
      "suggestions": ["建议1", "建议2", "建议3"]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
};

export const generateDecision = async (data: StartupData) => {
  const model = "gemini-3.1-flash-lite-preview";
  const prompt = `
    你是一位创业模拟游戏的策划。根据以下创业项目状态，生成一个关键的决策点。
    项目想法: ${data.idea}
    当前资金: ${data.initialCapital}
    当前市场份额: ${data.marketShare}%
    当前声望: ${data.reputation}/100

    请随机选择一个决策类别（如：产品定价、营销渠道、团队招聘、融资选择、技术架构）。
    提供3个具有不同风险和回报的选项。
    请以 JSON 格式返回：
    {
      "title": "决策标题",
      "context": "决策背景描述...",
      "options": [
        {
          "id": "opt1",
          "label": "选项简短标题",
          "description": "选项详细描述",
          "impact": {
            "shortTerm": "短期影响描述",
            "longTerm": "长期影响描述",
            "financial": -5000, (资金变化值)
            "marketShare": 2, (市场份额变化百分比)
            "reputation": 5 (声望变化值)
          }
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
};

export const simulatePitch = async (data: StartupData, userPitch: string) => {
  const model = "gemini-3.1-flash-lite-preview";
  const prompt = `
    你是一位挑剔的风险投资人（VC）。
    项目背景：
    - 想法: ${data.idea}
    - 商业模式: ${data.revenueModel}
    
    创业者正在向你路演，他说：
    "${userPitch}"

    请针对他的路演提出3个尖锐的问题，并给出一个初步的投资意向评估。
    请以 JSON 格式返回：
    {
      "feedback": "对路演表现的评价...",
      "questions": ["问题1", "问题2", "问题3"],
      "investmentIntent": "明确的意向（如：强烈关注、继续观察、拒绝）"
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
};

export const generateFinalFeedback = async (data: StartupData, history: {title: string, choice: string}[]) => {
  const model = "gemini-3.1-flash-lite-preview";
  const prompt = `
    你是一位资深的创业导师和终极评审。
    这个创业项目已经完成了模拟周期的关键决策阶段。
    
    最终项目状态：
    - 想法: ${data.idea}
    - 剩余资金: ¥${data.initialCapital}
    - 市场份额: ${data.marketShare}%
    - 声望: ${data.reputation}/100
    
    决策历史：
    ${history.map(h => `- ${h.title}: 选择了 "${h.choice}"`).join('\n')}

    请根据以上信息，给出一段总结性的评估。
    评价其领导风格、项目的前景、以及在模拟过程中表现出的优缺点。
    最后给出一个“创业成就等级”（如：独角兽潜力、稳健经营者、遗憾出局等）。
    
    请以 JSON 格式返回：
    {
      "summary": "总结性评价...",
      "strengths": ["优点1", "优点2"],
      "weaknesses": ["缺点1", "缺点2"],
      "achievement": "成就等级名称"
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
};
