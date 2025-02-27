import axios from 'axios';
export class DifyClient {
    client;
    /**
     * 创建一个新的 DifyClient 实例。
     * @param baseUrl - Dify API 的基础 URL
     * @param appSk - 应用程序的密钥
     */
    constructor(baseUrl, appSk) {
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                Authorization: `Bearer ${appSk}`,
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * 获取应用信息。
     * @returns 应用信息
     */
    async getAppInfo() {
        try {
            const response = await this.client.get('/info');
            return response.data;
        }
        catch (error) {
            throw new Error(`获取应用信息失败: ${error.message}`);
        }
    }
    /**
     * 获取参数。
     * @returns 参数
     */
    async getParameters() {
        try {
            const response = await this.client.get('/parameters');
            return response.data;
        }
        catch (error) {
            throw new Error(`获取参数失败: ${error.message}`);
        }
    }
    /**
     * 运行工作流。
     * @param inputs - 输入数据
     * @returns 工作流输出
     */
    async runWorkflow(inputs) {
        try {
            const randomUser = this.generateRandomUser();
            const response = await this.client.post('/workflows/run', {
                inputs,
                response_mode: 'blocking',
                user: randomUser,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return ([response.data.data.outputs.code, response.data.data.outputs.checkResult].join('\n\n') ||
                'No response from workflow');
        }
        catch (error) {
            throw new Error(`运行工作流失败: ${error.message}`);
        }
    }
    /**
     * 停止执行任务。
     * @param taskId - 任务 ID
     */
    async stopExecution(taskId) {
        try {
            await this.client.post(`/chat-messages/${taskId}/stop`);
        }
        catch (error) {
            throw new Error(`停止执行任务失败: ${error.message}`);
        }
    }
    /**
     * 生成随机用户名。
     * @returns 随机用户名
     */
    generateRandomUser() {
        return `dify-mcp-server-ts-${Math.random().toString(16).slice(0, 12)}`;
    }
}
