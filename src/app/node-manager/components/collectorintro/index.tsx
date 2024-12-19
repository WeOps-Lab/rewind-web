import Icon from "@/components/icon";

function Collectorintro() {
  return (
    <div className="h-[58px] flex flex-col justify-items-center">
      <div className="flex justify-center">
        <div><Icon type="yunquyu" style={{ height: '35px', width: '35px' }}></Icon></div>
      </div>
      <div className="flex justify-center">
        <h1>Default Cloud Region</h1>
      </div>
    </div>
  );
}
export default Collectorintro;
