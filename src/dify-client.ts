import axios, { AxiosInstance } from 'axios';
import { DifyAppInfo, DifyParameters } from './types.js';

/**
 * 封装 Axios 客户端，处理通用配置和请求。
 */
class HttpClient {
  private client: AxiosInstance;

  /**
   * 构造函数，创建 HttpClient 实例。
   * @param baseUrl 基础 URL
   * @param appSk 应用密钥
   */
  constructor(baseUrl: string, appSk: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${appSk}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 发起 GET 请求。
   * @param url 请求 URL
   * @returns 响应数据
   * @throws 当请求失败时抛出错误
   */
  async get<T>(url: string): Promise<T> {
    try {
      const response = await this.client.get<T>(url);
      return response.data;
    } catch (error: any) {
      throw new Error(`GET 请求失败: ${error.message}`);
    }
  }

  /**
   * 发起 POST 请求。
   * @param url 请求 URL
   * @param data 请求数据
   * @returns 响应数据
   * @throws 当请求失败时抛出错误
   */
  async post<T>(url: string, data: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error: any) {
      throw new Error(`POST 请求失败: ${error.message}`);
    }
  }
}

/**
 * 提供与 Dify API 交互的方法。
 */
export class DifyClient {
  private httpClient: HttpClient;

  /**
   * 构造函数，创建 DifyClient 实例。
   * @param baseUrl Dify API 的基础 URL
   * @param appSk 应用程序的密钥
   */
  constructor(baseUrl: string, appSk: string) {
    this.httpClient = new HttpClient(baseUrl, appSk);
  }

  /**
   * 获取 Dify 应用的信息。
   * @returns 包含应用信息的 Promise
   * @throws 当获取应用信息失败时抛出错误
   */
  async getAppInfo(): Promise<DifyAppInfo> {
    try {
      return await this.httpClient.get<DifyAppInfo>('/info');
    } catch (error: any) {
      throw new Error(`获取应用信息失败: ${error.message}`);
    }
  }

  /**
   * 获取 Dify 应用的参数。
   * @returns 包含应用参数的 Promise
   * @throws 当获取参数失败时抛出错误
   */
  async getParameters(): Promise<DifyParameters> {
    try {
      return await this.httpClient.get<DifyParameters>('/parameters');
    } catch (error: any) {
      throw new Error(`获取参数失败: ${error.message}`);
    }
  }

  /**
   * 运行 Dify 工作流。
   * @param inputs 工作流的输入数据
   * @returns 包含工作流输出的 Promise
   * @throws 当运行工作流失败时抛出错误
   */
  async runWorkflow(inputs: Record<string, any>): Promise<string> {
    try {
      const randomUser = this.generateRandomUser();
      const responseData = await this.httpClient.post<{
        data: { outputs: { code: string; checkResult: string } };
      }>('/workflows/run', {
        inputs,
        response_mode: 'blocking',
        user: randomUser,
      });

      const { code, checkResult } = responseData.data.outputs;
      const result = [code, checkResult].join('\n\n');
      return result || 'No response from workflow';
    } catch (error: any) {
      throw new Error(`运行工作流失败: ${error.message}`);
    }
  }

  /**
   * 停止指定 ID 的任务执行。
   * @param taskId 要停止的任务的 ID
   * @throws 当停止执行任务失败时抛出错误
   */
  async stopExecution(taskId: string): Promise<void> {
    try {
      await this.httpClient.post<void>(`/chat-messages/${taskId}/stop`, null); // 修改点：不传递请求体
    } catch (error: any) {
      throw new Error(`停止执行任务失败: ${error.message}`);
    }
  }

  /**
   * 生成一个随机的用户名。
   * @returns 随机生成的用户名
   */
  private generateRandomUser(): string {
    return `dify-mcp-server-ts-${Math.random().toString(16).slice(0, 12)}`;
  }
}
