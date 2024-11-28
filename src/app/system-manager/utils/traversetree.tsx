import  {DataType}  from '@/app/system-manager/types/teamstypes';
const traverseTree = (nodes:DataType[], callback: (node: DataType) => void) => {
  for (const node of nodes) {
    callback(node);
    if (node.children) {
      traverseTree(node.children, callback);
    }
  }
};
export default  traverseTree ;