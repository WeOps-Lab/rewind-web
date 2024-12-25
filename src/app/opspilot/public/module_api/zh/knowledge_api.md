## API调用说明

提供知识库的对外接口，用户可以基于关键字进行检索相关知识库内容

## API调用示例

### 1、查询知识库


**请求参数**

|参数名称|是否必须|示例
|---|---|---|
|name|否|12|


**输出示例**

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
      "name": "知识库测试",
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

字段说明如下

id: ``1``  唯一标识符，表示该知识库的ID。

team_name: ``["admin"]``团队名称的数组，表示该数据对象所属的团队。

created_at: ``"2024-09-04 15:52:21"``记录创建的时间戳。

updated_at: ``"2024-09-04 15:52:21"``记录最后更新的时间戳。
c
reated_by: ``"admin"``创建该记录的用户。

updated_by: ``""``最后更新该记录的用户（为空表示没有更新记录）。

name: ``"知识库测试"``记录的名称。

introduction: ``"abcjde"``记录的简介信息。

team: ``"2135b2b5-cbb4-4aea-8350-7329dcb6671a"``团队的唯一标识ID，用于关联团队。

enable_vector_search: ``true``布尔值，指示是否启用向量搜索。

vector_search_weight:`` 0.1``向量搜索的权重.

enable_text_search: ``true``布尔值，指示是否启用文本搜索。

text_search_weight: ``0.9``文本搜索的权重，表示在搜索算法中文本搜索的重要性。

enable_rerank: ``false``布尔值，是否启用重新排序功能。

embed_model: ``2``嵌入模型的标识符，用于表示模型的类型或版本。

rerank_model: ``1``重新排序模型的标识符，用于表示模型的类型或版本。