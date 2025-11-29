# Utils 模块

Utils模块提供了jvavscratch中使用的通用工具函数库，包含各种辅助功能，如文件操作、路径处理、字符串处理、数据转换等。这些工具函数被其他模块广泛使用，也可以在用户代码中直接使用。

## 模块结构

Utils模块按照功能划分为多个子模块：

| 子模块 | 主要功能 | 文件位置 |
|-------|---------|--------|
| File | 文件操作相关工具 | `jvavscratch/utils/file` |
| Path | 路径处理相关工具 | `jvavscratch/utils/path` |
| String | 字符串处理相关工具 | `jvavscratch/utils/string` |
| Data | 数据处理和转换工具 | `jvavscratch/utils/data` |
| Logger | 日志记录工具 | `jvavscratch/utils/logger` |
| Validator | 数据验证工具 | `jvavscratch/utils/validator` |
| Hash | 哈希计算工具 | `jvavscratch/utils/hash` |

## API概述

### File工具

#### `readFile(filePath, options)`

读取文件内容。

**参数：**
- `filePath`: 文件路径
- `options`: 读取选项
  - `encoding`: 文件编码（默认：'utf8'）
  - `flag`: 文件标志（默认：'r'）

**返回值：**
- Promise，解析为文件内容字符串

**示例：**
```javascript
const { readFile } = require('jvavscratch/utils/file');
const content = await readFile('./src/main.js');
```

#### `writeFile(filePath, content, options)`

写入文件内容。

**参数：**
- `filePath`: 文件路径
- `content`: 要写入的内容
- `options`: 写入选项
  - `encoding`: 文件编码（默认：'utf8'）
  - `flag`: 文件标志（默认：'w'）

**返回值：**
- Promise，解析为写入操作的结果

**示例：**
```javascript
const { writeFile } = require('jvavscratch/utils/file');
await writeFile('./output.js', 'console.log("Hello");');
```

#### `exists(path)`

检查文件或目录是否存在。

**参数：**
- `path`: 文件或目录路径

**返回值：**
- Promise，解析为布尔值，表示是否存在

**示例：**
```javascript
const { exists } = require('jvavscratch/utils/file');
const fileExists = await exists('./file.js');
```

#### `mkdir(dirPath, options)`

创建目录，可以创建多级目录。

**参数：**
- `dirPath`: 目录路径
- `options`: 创建选项
  - `recursive`: 是否递归创建（默认：false）

**返回值：**
- Promise，解析为创建操作的结果

**示例：**
```javascript
const { mkdir } = require('jvavscratch/utils/file');
await mkdir('./output/dir', { recursive: true });
```

### Path工具

#### `join(...paths)`

连接多个路径片段。

**参数：**
- `...paths`: 路径片段

**返回值：**
- 连接后的路径字符串

**示例：**
```javascript
const { join } = require('jvavscratch/utils/path');
const fullPath = join('dir', 'subdir', 'file.js');
```

#### `dirname(path)`

获取目录名。

**参数：**
- `path`: 路径

**返回值：**
- 目录名

**示例：**
```javascript
const { dirname } = require('jvavscratch/utils/path');
const dir = dirname('/path/to/file.js'); // '/path/to'
```

#### `basename(path, ext)`

获取文件名。

**参数：**
- `path`: 路径
- `ext`: 可选，文件扩展名

**返回值：**
- 文件名

**示例：**
```javascript
const { basename } = require('jvavscratch/utils/path');
const name = basename('/path/to/file.js'); // 'file.js'
const nameWithoutExt = basename('/path/to/file.js', '.js'); // 'file'
```

#### `extname(path)`

获取文件扩展名。

**参数：**
- `path`: 路径

**返回值：**
- 文件扩展名，包含点号

**示例：**
```javascript
const { extname } = require('jvavscratch/utils/path');
const ext = extname('/path/to/file.js'); // '.js'
```

### String工具

#### `camelCase(str)`

将字符串转换为驼峰命名法。

**参数：**
- `str`: 输入字符串

**返回值：**
- 驼峰命名的字符串

**示例：**
```javascript
const { camelCase } = require('jvavscratch/utils/string');
const camel = camelCase('hello_world'); // 'helloWorld'
```

#### `kebabCase(str)`

将字符串转换为短横线命名法。

**参数：**
- `str`: 输入字符串

**返回值：**
- 短横线命名的字符串

**示例：**
```javascript
const { kebabCase } = require('jvavscratch/utils/string');
const kebab = kebabCase('HelloWorld'); // 'hello-world'
```

#### `snakeCase(str)`

将字符串转换为下划线命名法。

**参数：**
- `str`: 输入字符串

**返回值：**
- 下划线命名的字符串

**示例：**
```javascript
const { snakeCase } = require('jvavscratch/utils/string');
const snake = snakeCase('HelloWorld'); // 'hello_world'
```

#### `truncate(str, length, suffix)`

截断字符串。

**参数：**
- `str`: 输入字符串
- `length`: 最大长度
- `suffix`: 后缀（默认：'...'）

**返回值：**
- 截断后的字符串

**示例：**
```javascript
const { truncate } = require('jvavscratch/utils/string');
const truncated = truncate('Hello world', 5); // 'Hello...'
```

### Data工具

#### `deepClone(obj)`

深度克隆对象。

**参数：**
- `obj`: 要克隆的对象

**返回值：**
- 克隆后的新对象

**示例：**
```javascript
const { deepClone } = require('jvavscratch/utils/data');
const original = { a: 1, b: { c: 2 } };
const clone = deepClone(original);
```

#### `mergeObjects(target, ...sources)`

合并多个对象。

**参数：**
- `target`: 目标对象
- `...sources`: 源对象

**返回值：**
- 合并后的对象

**示例：**
```javascript
const { mergeObjects } = require('jvavscratch/utils/data');
const result = mergeObjects({ a: 1 }, { b: 2 }, { a: 3 }); // { a: 3, b: 2 }
```

#### `isEqual(a, b)`

深度比较两个值是否相等。

**参数：**
- `a`: 第一个值
- `b`: 第二个值

**返回值：**
- 布尔值，表示是否相等

**示例：**
```javascript
const { isEqual } = require('jvavscratch/utils/data');
const equal = isEqual({ a: 1, b: 2 }, { a: 1, b: 2 }); // true
```

#### `sortObjectKeys(obj, order)`

按指定顺序对对象的键进行排序。

**参数：**
- `obj`: 要排序的对象
- `order`: 排序函数或键的顺序数组

**返回值：**
- 键按指定顺序排列的新对象

**示例：**
```javascript
const { sortObjectKeys } = require('jvavscratch/utils/data');
const sorted = sortObjectKeys({ c: 3, a: 1, b: 2 }, ['a', 'b', 'c']);
```

### Logger工具

#### `logger.level`

设置或获取日志级别：'debug', 'info', 'warn', 'error'。

**示例：**
```javascript
const { logger } = require('jvavscratch/utils/logger');
logger.level = 'info';
```

#### `logger.debug(...args)`

记录调试日志。

**参数：**
- `...args`: 要记录的参数

**示例：**
```javascript
logger.debug('Debug message', { data: 'value' });
```

#### `logger.info(...args)`

记录信息日志。

**参数：**
- `...args`: 要记录的参数

**示例：**
```javascript
logger.info('Info message');
```

#### `logger.warn(...args)`

记录警告日志。

**参数：**
- `...args`: 要记录的参数

**示例：**
```javascript
logger.warn('Warning message');
```

#### `logger.error(...args)`

记录错误日志。

**参数：**
- `...args`: 要记录的参数

**示例：**
```javascript
logger.error('Error message', error);
```

### Validator工具

#### `isValidVariableName(name)`

检查是否是有效的变量名。

**参数：**
- `name`: 变量名

**返回值：**
- 布尔值，表示是否有效

**示例：**
```javascript
const { isValidVariableName } = require('jvavscratch/utils/validator');
const valid = isValidVariableName('myVar'); // true
const invalid = isValidVariableName('1var'); // false
```

#### `validateScratchName(name)`

验证是否是有效的Scratch名称（变量、列表、广播等）。

**参数：**
- `name`: 名称

**返回值：**
- 布尔值，表示是否有效

**示例：**
```javascript
const { validateScratchName } = require('jvavscratch/utils/validator');
const valid = validateScratchName('my variable'); // true
```

### Hash工具

#### `md5(str)`

计算字符串的MD5哈希值。

**参数：**
- `str`: 输入字符串

**返回值：**
- MD5哈希字符串

**示例：**
```javascript
const { md5 } = require('jvavscratch/utils/hash');
const hash = md5('hello world');
```

#### `sha1(str)`

计算字符串的SHA1哈希值。

**参数：**
- `str`: 输入字符串

**返回值：**
- SHA1哈希字符串

**示例：**
```javascript
const { sha1 } = require('jvavscratch/utils/hash');
const hash = sha1('hello world');
```

## 通用工具函数

除了上述分类工具外，Utils模块还提供了一些通用的工具函数：

### `delay(ms)`

延迟指定的毫秒数。

**参数：**
- `ms`: 毫秒数

**返回值：**
- Promise，在指定时间后解析

**示例：**
```javascript
const { delay } = require('jvavscratch/utils');
await delay(1000); // 延迟1秒
```

### `retry(fn, options)`

重试函数执行。

**参数：**
- `fn`: 要执行的函数
- `options`: 重试选项
  - `maxRetries`: 最大重试次数（默认：3）
  - `delay`: 重试间隔（默认：1000ms）
  - `onRetry`: 重试回调函数

**返回值：**
- Promise，解析为函数执行结果

**示例：**
```javascript
const { retry } = require('jvavscratch/utils');
const result = await retry(() => fetchData(), {
  maxRetries: 5,
  delay: 2000
});
```

### `throttle(fn, delay)`

函数节流，限制函数的执行频率。

**参数：**
- `fn`: 要节流的函数
- `delay`: 延迟时间（毫秒）

**返回值：**
- 节流后的函数

**示例：**
```javascript
const { throttle } = require('jvavscratch/utils');
const throttledFunction = throttle(() => {
  console.log('Throttled function called');
}, 1000);
```

### `debounce(fn, delay)`

函数防抖，在指定时间内只执行一次。

**参数：**
- `fn`: 要防抖的函数
- `delay`: 延迟时间（毫秒）

**返回值：**
- 防抖后的函数

**示例：**
```javascript
const { debounce } = require('jvavscratch/utils');
const debouncedFunction = debounce(() => {
  console.log('Debounced function called');
}, 1000);
```

## 最佳实践

1. **使用适当的工具函数**：根据需要选择合适的工具函数
2. **注意性能**：对于频繁调用的操作，注意选择性能较好的实现
3. **错误处理**：使用文件操作等异步函数时，确保正确处理错误
4. **避免重复**：优先使用Utils模块提供的函数，避免重复实现