## API Description

Provides external interfaces for the knowledge base, allowing users to retrieve relevant knowledge base content based on keywords.

## API Example

### 1. Query Knowledge Base

**Request Parameters**

|Parameter Name|Required|Example
|---|---|---|
|name|No|12|

**Output Example**

~~~
{
  "result": true,
  "data": [
    {
      "id": 1,
      "team_name": [
        "admin"
      ],
      "created_at": "2024-09-04 15:52:21",
      "updated_at": "2024-09-04 15:52:21",
      "created_by": "admin",
      "updated_by": "",
      "name": "Knowledge Base Test",
      "introduction": "abcjde",
      "team": "2135b2b5-cbb4-4aea-8350-7329dcb6671a",
      "enable_vector_search": true,
      "vector_search_weight": 0.1,
      "enable_text_search": true,
      "text_search_weight": 0.9,
      "enable_rerank": false,
      "embed_model": 2,
      "rerank_model": 1
    }
  ]
}
~~~

Field Descriptions:

id: `1` - Unique identifier representing the ID of the knowledge base.

team_name: `["admin"]` - Array of team names representing the team(s) to which the data object belongs.

created_at: `"2024-09-04 15:52:21"` - Timestamp when the record was created.

updated_at: `"2024-09-04 15:52:21"` - Timestamp when the record was last updated.

created_by: `"admin"` - User who created the record.

updated_by: `""` - User who last updated the record (empty if not updated).

name: `"Knowledge Base Test"` - Name of the record.

introduction: `"abcjde"` - Introduction information of the record.

team: `"2135b2b5-cbb4-4aea-8350-7329dcb6671a"` - Unique identifier of the team, used to associate the team.

enable_vector_search: `true` - Boolean indicating whether vector search is enabled.

vector_search_weight: `0.1` - Weight of vector search.

enable_text_search: `true` - Boolean indicating whether text search is enabled.

text_search_weight: `0.9` - Weight of text search, indicating the importance of text search in the algorithm.

enable_rerank: `false` - Boolean indicating whether re-rank is enabled.

embed_model: `2` - Identifier of the embedding model, representing the type or version of the model.

rerank_model: `1` - Identifier of the re-rank model, representing the type or version of the model.