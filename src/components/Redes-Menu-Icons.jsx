import { RiWhatsappLine, RiInstagramLine, RiFacebookCircleLine,RiArticleLine } from "@remixicon/react";


export default () => {
  return (
    <div className="mx-auto max-w-52 flex items-center">
      <a href="https://vitejs.dev" target="_blank" className="mt-1 mx-auto">
        <RiWhatsappLine size={30} className=" text-gray-500" />
      </a>
      <RiInstagramLine size={30} className="mt-1 mx-auto text-gray-500" />
      <RiFacebookCircleLine size={30} className="mt-1 mx-auto text-gray-500" />
      <RiArticleLine size={30} className="mt-1 mx-auto text-pink-500" />
    </div>
  );
};
