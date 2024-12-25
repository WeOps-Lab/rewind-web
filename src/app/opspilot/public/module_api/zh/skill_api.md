## API调用说明

提供技能的对外接口，用户可以调用接口实现技能的使用。


## API调用示例

### 1、获取技能列表

**请求参数**

|参数名称|是否必须|示例
|---|---|---|
|name|否|技能1|
|page_size|是|10|
|page|是|1|

**返回数据**

~~~
{
  "result": true,
  "code": "20000",
  "message": "success",
  "data": {
    "count": 1,
    "items": [
      {
        "id": 10,
        "team_name": [
          "游客"
        ],
        "created_by": "1406489435@qq.com",
        "updated_by": "1406489435@qq.com",
        "name": "你好hello",
        "skill_id": null,
        "skill_prompt": null,
        "enable_conversation_history": false,
        "conversation_window_size": 10,
        "enable_rag": false,
        "enable_rag_knowledge_source": false,
        "rag_score_threshold": 0.7,
        "introduction": "56",
        "team": [
          "8bb5627e-3a25-45b9-850b-62d570a9282b"
        ],
        "llm_model": null,
        "knowledge_base": []
      }
    ]
  }
}
~~~

字段说明如下

count: ``1``表示返回的条目数量，在此示例中为 1。

items: ``[...]``数据条目的数组，包含具体的记录信息。在此示例中数组中有一个对象。

id: ``10``唯一标识符，表示该对象的 ID。

team_name: ``["游客"]``团队名称的数组，表示该对象所属的团队。

created_by: ``"1406489435@qq.com"``创建该记录的用户的邮箱地址。

updated_by:`` "1406489435@qq.com"``最后更新该记录的用户的邮箱地址。

name: ``"你好hello"``名称。

skill_id: ``null``技能标识符，当前为空，表示没有关联技能。

skill_prompt: ``null``技能提示，当前为空，表示没有关联技能提示。

enable_conversation_history: ``false``布尔值，指示是否启用对话历史。

conversation_window_size: ``10``指定对话窗口的大小，即可回顾的聊天记录条数。

enable_rag: ``false``布尔值，指示是否启用 RAG（Retrieval-Augmented Generation）。

enable_rag_knowledge_source: ``false``布尔值，指示是否启用 RAG 知识来源。

rag_score_threshold: ``0.7``RAG 分数阈值，决定哪些知识被纳入对话中。

introduction: ``"56"``记录的简介信息。

team: ``["8bb5627e-3a25-45b9-850b-62d570a9282b"]``团队的唯一标识 ID，用于关联团队。

llm_model: ``null``大语言模型的标识符，当前为空。

knowledge_base: ``[]``知识库的数组，当前为空，表示没有关联的知识内容。

### 2、技能测试

**请求参数**

Headers：

|参数名称|是否必须|示例
|---|---|---|
|Content-Type|application/json|是|

Query：

|参数名称|是否必须|示例
|---|---|---|
|name|否|技能1|
|page_size|是|10|
|page|是|1|


Body:

~~~
{
            "user_message": "你好", // 用户消息
            "llm_model": 1, // 大模型ID
            "skill_prompt": "abc", // Prompt
            "enable_rag": true, // 是否启用RAG
            "enable_rag_knowledge_source": true, // 是否显示RAG知识来源
            "rag_score_threshold": [{"knowledge_base": 1, "score": 0.7}], // RAG分数阈值
            "chat_history": [{"event": "user", "text": "abc"}, {"event": "bot", "text": "ab"}], // 对话历史
            "conversation_window_size": 10, // 对话窗口大小
            "temperature": 0.7
        }
~~~

**返回数据**

~~~
{
  "result": true,
  "code": "20000",
  "message": "success",
  "data": {
    "count": 1,
    "items": [
      {
        "id": 10,
        "team_name": [
          "游客"
        ],
        "created_by": "1406489435@qq.com",
        "updated_by": "1406489435@qq.com",
        "name": "你好hello",
        "skill_id": null,
        "skill_prompt": null,
        "enable_conversation_history": false,
        "conversation_window_size": 10,
        "enable_rag": false,
        "enable_rag_knowledge_source": false,
        "rag_score_threshold": 0.7,
        "introduction": "56",
        "team": [
          "8bb5627e-3a25-45b9-850b-62d570a9282b"
        ],
        "llm_model": null,
        "knowledge_base": []
      }
    ]
  }
}
~~~

count: ``1``表示返回的条目数量，此示例中为 1，说明只有一条数据。

items: ``[...]``数据条目的数组，包含特定记录的信息。

id: ``10``唯一标识符，用于标识该数据对象。

team_name: ``["游客"]``团队名称的数组，表示该记录所属的团队是“游客”。

created_by: ``"1406489435@qq.com"``创建用户的邮箱地址。

updated_by: ``"1406489435@qq.com"``最后更新该记录的用户的邮箱地址。

name: ``"你好hello"``名称，表明这是一个对话主题或标识。

skill_id: ``null``技能标识符，当前为空，表示此记录并未指定任何技能。

skill_prompt: ``null``技能提示，当前为空，表示没有为该记录提供技能提示。

enable_conversation_history: ``false``布尔值，指示是否启用对话历史记录。此处为 false 表示不启用。

conversation_window_size: ``10``指定对话窗口的大小，为 10，表示可回顾的聊天记录条数。

enable_rag: ``false``布尔值，指示是否启用 RAG（Retrieval-Augmented Generation）。此处值为 false 表示不启用。

enable_rag_knowledge_source: ``false``布尔值，指示是否启用 RAG 知识来源，此处值为 false 表示不启用。

rag_score_threshold: ``0.7``RAG 分数阈值，决定哪些知识会被纳入对话中，当前设置为 0.7。

introduction: ``"56"``记录的简介信息。

team: ``["8bb5627e-3a25-45b9-850b-62d570a9282b"]``团队队的唯一标识符，用于关联到具体的团队。

llm_model: ``null``大语言模型的标识符，当前为空，表示没有指定任何模型。

knowledge_base: ``[]``知识库的数组，当前为空，表示没有关联的知识内容。

### 2、技能设置保存

**请求参数**

路径参数：

|参数名称|示例|备注
|---|---|---|
|id|1||

Headers：
|参数名称|是否必须|示例
|---|---|---|
|Content-Type|application/json|是|

Query：

|参数名称|是否必须|示例
|---|---|---|
|name|否|技能1|
|page_size|是|10|
|page|是|1|


Body:

~~~
{
    "name": "abc", 
    "team": ["11", "22"],
            "introduction": "introduction", // 用户消息
            "llm_model": 1, // 大模型ID
            "skill_prompt": "abc", // Prompt
            "enable_conversation_history": true, 
            "enable_rag": true, // 是否启用RAG
            "enable_rag_knowledge_source": true, // 是否显示RAG知识来源
            "rag_score_threshold": [{"knowledge_base": 1, "score": 0.7}], // RAG分数阈值
"temperature": 0.7, 
            "conversation_window_size": 10 // 对话窗口大小
        }
~~~

**返回数据**

~~~
{
  "result": true
}
~~~