## API Call Instructions

Provides external interfaces for skills that users can call to utilize the skills.


## API Call Examples

### 1. Get Skills List

**Request Parameters**

|Parameter Name|Required|Example
|---|---|---|
|name|No|Skill1|
|page_size|Yes|10|
|page|Yes|1|

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
          "Guest"
        ],
        "created_by": "1406489435@qq.com",
        "updated_by": "1406489435@qq.com",
        "name": "Hello",
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

Field Descriptions

count: ``1``Indicates the number of returned items, which is 1 in this example.

items: ``[...]``Array of data entries containing detailed records. In this example, the array contains one object.

id: ``10``Unique identifier indicating the ID of the object.

team_name: ``["Guest"]``Array of team names, indicating the team to which the object belongs.

created_by: ``"1406489435@qq.com"``Email address of the user who created the record.

updated_by:`` "1406489435@qq.com"``Email address of the user who last updated the record.

name: ``"Hello"``Name.

skill_id: ``null``Skill identifier, currently null, indicating no associated skill.

skill_prompt: ``null``Skill prompt, currently null, indicating no associated skill prompt.

enable_conversation_history: ``false``Boolean value indicating whether conversation history is enabled.

conversation_window_size: ``10``Specifies the size of the conversation window, i.e., the number of chat records that can be reviewed.

enable_rag: ``false`` Boolean value indicating whether RAG (Retrieval-Augmented Generation) is enabled.

enable_rag_knowledge_source: ``false``Boolean value indicating whether RAG knowledge source is enabled.

rag_score_threshold: ``0.7``RAG score threshold, determining which knowledge is incorporated into the conversation.

introduction: ``"56"``Introduction information of the record.

team: ``["8bb5627e-3a25-45b9-850b-62d570a9282b"]``Unique identifier of the team, used to associate the team.

llm_model: ``null``Large language model identifier, currently null.

knowledge_base: ``[]``Array of knowledge bases, currently empty, indicating no associated knowledge content.

### 2. Skill Test

**Request Parameters**

Headers：

|Parameter Name|Required|Example
|---|---|---|
|Content-Type|application/json|Yes|

Query：

|Parameter Name|Required|Example
|---|---|---|
|name|No|Skill1|
|page_size|Yes|10|
|page|No|1|


Body:

~~~
{
  "user_message": "Hello", // User message
  "llm_model": 1, // Large model ID
  "skill_prompt": "abc", // Prompt
  "enable_rag": true, // Enable RAG
  "enable_rag_knowledge_source": true, // Show RAG knowledge source
  "rag_score_threshold": [{"knowledge_base": 1, "score": 0.7}], // RAG score threshold
  "chat_history": [{"event": "user", "text": "abc"}, {"event": "bot", "text": "ab"}], // Chat history
  "conversation_window_size": 10, // Conversation window size
  "temperature": 0.7
}
~~~

**Response Data**

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
          "Guest"
        ],
        "created_by": "1406489435@qq.com",
        "updated_by": "1406489435@qq.com",
        "name": "Hello",
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

count: ``1``Indicates the number of returned items, which is 1 in this example.

items: ``[...]``Array of data entries containing detailed records. In this example, the array contains one object.

id: ``10``Unique identifier indicating the ID of the object.

team_name: ``["Guest"]``Array of team names, indicating the team to which the object belongs.

created_by: ``"1406489435@qq.com"``Email address of the user who created the record.

updated_by:`` "1406489435@qq.com"``Email address of the user who last updated the record.

name: ``"Hello"``Name.

skill_id: ``null``Skill identifier, currently null, indicating no associated skill.

skill_prompt: ``null``Skill prompt, currently null, indicating no associated skill prompt.

enable_conversation_history: ``false``Boolean value indicating whether conversation history is enabled.

conversation_window_size: ``10``Specifies the size of the conversation window, i.e., the number of chat records that can be reviewed.

enable_rag: ``false`` Boolean value indicating whether RAG (Retrieval-Augmented Generation) is enabled.

enable_rag_knowledge_source: ``false``Boolean value indicating whether RAG knowledge source is enabled.

rag_score_threshold: ``0.7``RAG score threshold, determining which knowledge is incorporated into the conversation.

introduction: ``"56"``Introduction information of the record.

team: ``["8bb5627e-3a25-45b9-850b-62d570a9282b"]``Unique identifier of the team, used to associate the team.

llm_model: ``null``Large language model identifier, currently null.

knowledge_base: ``[]``Array of knowledge bases, currently empty, indicating no associated knowledge content.

### 3. Save Skill Settings

**Request Parameters**

Path Parameters:

|Parameter|Example|Description
|---|---|---|
|id|1||

Headers：
|Parameter Name|Required|Example
|---|---|---|
|Content-Type|application/json|Yes|

Query：

|Parameter Name|Required|Example
|---|---|---|
|name|No|Skill1|
|page_size|Yes|10|
|page|Yes|1|


Body:

~~~
{
  "name": "abc", 
  "team": ["11", "22"],
  "introduction": "introduction", // User message
  "llm_model": 1, // Large model ID
  "skill_prompt": "abc", // Prompt
  "enable_conversation_history": true, 
  "enable_rag": true, // Enable RAG
  "enable_rag_knowledge_source": true, // Show RAG knowledge source
  "rag_score_threshold": [{"knowledge_base": 1, "score": 0.7}], // RAG score threshold
  "temperature": 0.7, 
  "conversation_window_size": 10 // Conversation window size
}
~~~

**Response Data**

~~~
{
  "result": true
}
~~~