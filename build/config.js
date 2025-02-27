import { readFileSync } from 'fs';
import { parse } from 'yaml';
/**
 * 从指定路径读取配置文件内容。
 * @param configPath - 配置文件的路径。
 * @returns 配置文件内容字符串。
 * @throws 当文件读取失败时抛出错误。
 */
function readConfigFile(configPath) {
    try {
        return readFileSync(configPath, 'utf8');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to read config file: ${errorMessage}`);
    }
}
/**
 * 解析配置文件内容为 DifyConfig 对象。
 * @param fileContents - 配置文件内容字符串。
 * @returns 解析后的 DifyConfig 对象。
 * @throws 当配置文件格式不正确时抛出错误。
 */
function parseConfigFile(fileContents) {
    try {
        return parse(fileContents);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to parse config file: ${errorMessage}`);
    }
}
/**
 * 验证 DifyConfig 对象是否包含必需的字段。
 * @param config - 要验证的 DifyConfig 对象。
 * @throws 当缺少必需字段时抛出错误。
 */
function validateConfig(config) {
    if (!config.dify_base_url) {
        throw new Error('Missing required field: dify_base_url');
    }
    if (!Array.isArray(config.dify_app_sks) || config.dify_app_sks.length === 0) {
        throw new Error('Missing or invalid field: dify_app_sks must be a non-empty array');
    }
}
/**
 * 从指定路径加载 Dify 配置。
 * @param configPath - 配置文件的路径。
 * @returns 加载的 Dify 配置对象。
 * @throws 当配置文件缺失、格式不正确或缺少必需字段时抛出错误。
 */
export function loadConfig(configPath) {
    try {
        const fileContents = readConfigFile(configPath);
        const config = parseConfigFile(fileContents);
        validateConfig(config);
        return config;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to load config: ${errorMessage}`);
    }
}
