export interface CollectTaskMessage {
    add: number;
    update: number;
    delete: number;
    association: number;
}

export interface CollectTask {
    id: number;
    name: string;
    task_type: string;
    driver_type: string;
    model_id: string;
    exec_status: number;
    updated_at: string;
    message: CollectTaskMessage;
    exec_time: string | null;
}

export interface TreeNode {
    id: string;
    key: string;
    name: string;
    type?: string;
    children?: TreeNode[];
}