import { RiWhatsappLine, RiInstagramLine, RiFacebookCircleLine,RiArticleLine } from "@remixicon/react";


export default () => {
  return (
    <div className="mx-auto max-w-52 flex items-center">
      <a href="https://wa.me/541123913064" target="_blank" className="mt-1 mx-auto">
        <RiWhatsappLine size={30} className=" text-green-500" />
      </a>
      <a href="https://www.instagram.com/bexo.com.ve" target="_blank" className="mt-1 mx-auto">
      <RiInstagramLine size={30} className="mt-1 mx-auto text-indigo-800" />
      </a>
      <RiFacebookCircleLine size={30} className="mt-1 mx-auto text-gray-500" />
      <a href="https://blog.bexo.com.ve" target="_self" className="mt-1 mx-auto">
      <RiArticleLine size={30} className=" text-pink-500" />
      </a>
    </div>
    
  );
};
