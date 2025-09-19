import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here" 
});

export interface ChatQuery {
  message: string;
  salesData?: any;
  inventoryData?: any;
  transactionsData?: any;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  data?: any;
}

export async function processAIChatQuery(query: ChatQuery): Promise<ChatResponse> {
  try {
    const systemPrompt = `You are an intelligent POS assistant for shopkeepers. You help analyze sales data, inventory management, and provide business insights. 

Context data available:
- Sales analytics: ${JSON.stringify(query.salesData || {})}
- Inventory data: ${JSON.stringify(query.inventoryData || {})}
- Recent transactions: ${JSON.stringify(query.transactionsData || {})}

Provide helpful, actionable insights in a friendly manner. Always respond with JSON in this format:
{
  "message": "Your response message",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "data": {} // any relevant data to display
}

Keep responses concise but informative. Focus on practical business advice.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query.message }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      message: result.message || "I'm here to help with your business insights!",
      suggestions: result.suggestions || [],
      data: result.data || null,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      message: "I'm currently unable to process your request. Please try again later.",
      suggestions: [
        "Check your sales dashboard for recent trends",
        "Review inventory alerts for low stock items",
        "Consider analyzing your top-selling products"
      ],
    };
  }
}

export async function generateInventoryInsights(inventoryData: any[], salesData: any): Promise<ChatResponse> {
  try {
    const prompt = `Analyze this inventory and sales data to provide actionable insights:

Inventory: ${JSON.stringify(inventoryData)}
Sales Data: ${JSON.stringify(salesData)}

Provide insights about:
1. Which products to reorder
2. Slow-moving inventory suggestions
3. Optimal stock levels
4. Profit optimization opportunities

Respond in JSON format with message and suggestions.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      message: result.message || "Here are your inventory insights.",
      suggestions: result.suggestions || [],
      data: result.data || null,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      message: "Unable to generate inventory insights at the moment.",
      suggestions: [
        "Review products with low stock levels",
        "Check for slow-moving inventory",
        "Monitor expiring products"
      ],
    };
  }
}
