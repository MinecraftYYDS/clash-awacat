# yaml.js - YAML 序列化器

**这是最容易出错的模块，请仔细实现和测试。**

## 导出

```javascript
export function toYaml(obj) // 将 JS 对象转为 YAML 字符串
```

## 实现规则

### 基本类型序列化

| 类型 | 输出 | 示例 |
|------|------|------|
| number | 不加引号 | `port: 7890` |
| boolean | true/false 不加引号 | `allow-lan: true` |
| null/undefined | 跳过该字段 | - |
| 普通字符串 | 不加引号 | `server: example.com` |
| 需要引号的字符串 | 加双引号 | `password: "abc123"` |

### 字符串何时需要加双引号

以下情况**必须**加双引号：
1. 空字符串 `""`
2. 值等于 `"true"`, `"false"`, `"null"`, `"yes"`, `"no"`, `"on"`, `"off"` (YAML 保留字)
3. 纯数字字符串 (如 `"123"`, `"3.14"`)
4. 包含以下任一特殊字符: `: # { } [ ] , & * ? | - < > = ! % @ \``
5. 以空格开头或结尾
6. 包含 `\n` 换行符

### 对象序列化

```yaml
key1: value1
key2: value2
nested:
  child1: value
  child2: value
```

- 每层缩进 2 个空格
- key 不需要引号（Clash 的 key 如 `skip-cert-verify` 包含 `-` 是合法的）

### 数组序列化

#### 简单值数组（字符串/数字）
```yaml
rules:
  - "RULE-SET,reject,REJECT"
  - "GEOIP,CN,DIRECT"
  - "MATCH,节点选择"
```
注意：rules 中的字符串包含逗号，必须加引号！

#### 对象数组（如 proxies, proxy-groups）
```yaml
proxies:
  - name: JP-Node
    type: hysteria2
    server: jp.awacat.cc
    port: 50000
    password: "neko233333"
    skip-cert-verify: false
  - name: Another
    type: ss
    server: example.com
    port: 443
    cipher: aes-256-gcm
    password: "mypass"
```

格式说明：
- 第一个 key 和 `- ` 在同一行
- 后续 key 缩进到与第一个 key 对齐（即 `- ` 后面的位置，多2个空格）
- 如果对象的某个值又是对象，继续嵌套缩进

#### 对象数组中嵌套对象
```yaml
proxy-groups:
  - name: 节点选择
    type: select
    proxies:
      - 自动选择
      - JP-Node
      - DIRECT
  - name: 自动选择
    type: url-test
    proxies:
      - JP-Node
    url: "http://www.gstatic.com/generate_204"
    interval: 300
    tolerance: 50
```

#### rule-providers（对象的对象）
```yaml
rule-providers:
  reject:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt"
    path: "./ruleset/reject.yaml"
    interval: 86400
  direct:
    type: http
    behavior: domain
    url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt"
    path: "./ruleset/direct.yaml"
    interval: 86400
```

### DNS 配置输出示例

```yaml
dns:
  enable: true
  enhanced-mode: fake-ip
  fake-ip-range: "198.18.0.1/16"
  nameserver:
    - "https://dns.alidns.com/dns-query"
    - "https://doh.pub/dns-query"
  fallback:
    - "https://1.1.1.1/dns-query"
    - "https://dns.google/dns-query"
  fallback-filter:
    geoip: true
    geoip-code: CN
```

注意 URL 字符串包含 `:` 和 `/`，必须加引号。

---

## 推荐实现方式

```javascript
export function toYaml(obj) {
  return serializeValue(obj, 0);
}

function serializeValue(value, indent) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return serializeArray(value, indent);
  if (typeof value === 'object') return serializeObject(value, indent);
  return formatScalar(value);
}

function serializeObject(obj, indent) {
  const pad = ' '.repeat(indent);
  let result = '';
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) continue;
    if (typeof val === 'object' && !Array.isArray(val)) {
      // 嵌套对象
      result += pad + key + ':\n' + serializeObject(val, indent + 2);
    } else if (Array.isArray(val)) {
      // 数组
      result += pad + key + ':\n' + serializeArray(val, indent + 2);
    } else {
      result += pad + key + ': ' + formatScalar(val) + '\n';
    }
  }
  return result;
}

function serializeArray(arr, indent) {
  if (arr.length === 0) return ' '.repeat(indent - 2) + '[]\n'; // 不太会出现
  const pad = ' '.repeat(indent);
  let result = '';
  for (const item of arr) {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      // 对象数组项
      const entries = Object.entries(item).filter(([,v]) => v !== null && v !== undefined);
      if (entries.length === 0) continue;
      // 第一个 key 和 - 同行
      const [firstKey, firstVal] = entries[0];
      if (typeof firstVal === 'object' && firstVal !== null) {
        result += pad + '- ' + firstKey + ':\n';
        if (Array.isArray(firstVal)) {
          result += serializeArray(firstVal, indent + 4);
        } else {
          result += serializeObject(firstVal, indent + 4);
        }
      } else {
        result += pad + '- ' + firstKey + ': ' + formatScalar(firstVal) + '\n';
      }
      // 后续 key
      for (let i = 1; i < entries.length; i++) {
        const [k, v] = entries[i];
        if (typeof v === 'object' && v !== null) {
          result += pad + '  ' + k + ':\n';
          if (Array.isArray(v)) {
            result += serializeArray(v, indent + 4);
          } else {
            result += serializeObject(v, indent + 4);
          }
        } else {
          result += pad + '  ' + k + ': ' + formatScalar(v) + '\n';
        }
      }
    } else {
      // 简单值数组项
      result += pad + '- ' + formatScalar(item) + '\n';
    }
  }
  return result;
}

function formatScalar(value) {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return needsQuotes(value) ? '"' + escapeString(value) + '"' : value;
  return 'null';
}

function needsQuotes(str) {
  if (str === '') return true;
  if (/^(true|false|null|yes|no|on|off)$/i.test(str)) return true;
  if (/^[\d.]+$/.test(str)) return true;  // 纯数字
  if (/[:#{}\[\],&*?|\-<>=!%@`"'\\\n]/.test(str)) return true;
  if (str.startsWith(' ') || str.endsWith(' ')) return true;
  return false;
}

function escapeString(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
```

---

## 测试用例

请确保以下输入输出正确：

输入: `{ port: 7890, 'allow-lan': true, mode: 'rule' }`
输出:
```
port: 7890
allow-lan: true
mode: rule
```

输入: `{ proxies: [{ name: 'test', type: 'ss', port: 443, password: 'abc:def' }] }`
输出:
```
proxies:
  - name: test
    type: ss
    port: 443
    password: "abc:def"
```

输入: `{ rules: ['GEOIP,CN,DIRECT', 'MATCH,节点选择'] }`
输出:
```
rules:
  - "GEOIP,CN,DIRECT"
  - "MATCH,节点选择"
```
