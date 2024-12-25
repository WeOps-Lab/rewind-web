import { useEffect, useState } from 'react';
import { message } from 'antd';
import useApiClient from '@/utils/request';

interface ConfigData {
  selectedSearchTypes: string[];
  rerankModel: boolean;
  selectedRerankModel: string | null;
  textSearchWeight: number;
  vectorSearchWeight: number;
  textSearchMode: string,
  quantity: number;
  candidate: number;
  selectedEmbedModel: string | null;
}

interface FormData {
  name?: string;
  introduction?: string;
  team?: string[];
}

const useFetchConfigData = (id: string | null) => {
  const { get } = useApiClient();
  const [formData, setFormData] = useState<FormData>({});
  const [configData, setConfigData] = useState<ConfigData>({
    selectedSearchTypes: [],
    rerankModel: false,
    selectedRerankModel: null,
    textSearchWeight: 0.5,
    vectorSearchWeight: 0.5,
    quantity: 10,
    candidate: 10,
    textSearchMode: 'match',
    selectedEmbedModel: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const data = await get(`/knowledge_mgmt/knowledge_base/${id}/`);
        const selectedSearchTypes = [];
        if (data.enable_text_search) selectedSearchTypes.push('textSearch');
        if (data.enable_vector_search) selectedSearchTypes.push('vectorSearch');

        setFormData({
          name: data.name || '',
          introduction: data.introduction || '',
          team: data.team || []
        });

        setConfigData({
          selectedSearchTypes,
          rerankModel: data.enable_rerank || false,
          selectedRerankModel: data.rerank_model || null,
          textSearchWeight: data.text_search_weight || 0.5,
          vectorSearchWeight: data.vector_search_weight || 0.5,
          quantity: data.rag_k || 10,
          candidate: data.rag_num_candidates || 10,
          textSearchMode: data.text_search_mode,
          selectedEmbedModel: data.embed_model || null,
        });
      } catch (error) {
        message.error('Failed to fetch config data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchConfigData();
    }
  }, [get, id]);

  return { formData, configData, setFormData, setConfigData, loading };
};

export default useFetchConfigData;