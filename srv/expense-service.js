const cds = require('@sap/cds');
const OpenAI = require('openai');

module.exports = cds.service.impl(async function () {

    const { Expenses } = this.entities;

    // Handler for the bound action "getSuggestion"
    this.on('getSuggestion', Expenses, async (req) => {

        // 1. Get the expense the action is being called on
        const expenseId = req.params[0].ID;
        const expense = await SELECT.one.from(Expenses).where({ ID: expenseId });

        if (!expense) {
            return req.error(404, 'Expense not found');
        }

        // 2. Build the prompt for the AI
        const prompt = `You are an expense management assistant inside an SAP Fiori application.

Analyze this expense and give a short (2-3 sentences max), actionable suggestion to help the user with their next step:

- Title: ${expense.title}
- Category: ${expense.category}
- Amount: ${expense.amount} ${expense.currency}
- Date: ${expense.date}
- Status: ${expense.status}
- Notes: ${expense.notes || '(no notes provided)'}

Consider the status:
- Draft: suggest what to do before submitting
- Submitted: explain what happens next or what to watch for
- Approved: confirm and suggest next steps (e.g. reimbursement, archiving)
- Rejected: suggest how to address the rejection

Be concise, friendly, and practical. Do not start with "Sure" or "Here is".`;

        // 3. Call GitHub Models
        try {
            const client = new OpenAI({
                baseURL: 'https://models.github.ai/inference',
                apiKey: process.env.GITHUB_TOKEN,
            });

            const response = await client.chat.completions.create({
                model: 'openai/gpt-4.1-mini',
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: 200,
                temperature: 0.7,
            });

            const suggestion = response.choices[0]?.message?.content?.trim() || 'No suggestion available.';

            return { suggestion };

        } catch (err) {
            console.error('AI call failed:', err);
            return req.error(500, 'AI suggestion failed: ' + err.message);
        }
    });
});