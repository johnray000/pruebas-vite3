import { RiWhatsappLine, RiInstagramLine, RiFacebookCircleLine } from "@remixicon/react";


export default () => {
  return (
    <div className="mx-auto max-w-36 flex items-center">
      <a href="https://vitejs.dev" target="_blank" className="mt-1 mx-auto">
        <RiWhatsappLine size={24} className=" text-gray-500" />
      </a>
      <RiInstagramLine size={24} className="mt-1 mx-auto text-gray-500" />
      <RiFacebookCircleLine size={24} className="mt-1 mx-auto text-gray-500" />
    </div>
  );
};
