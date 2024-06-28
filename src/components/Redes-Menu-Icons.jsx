import { RiWhatsappLine, RiInstagramLine, RiFacebookCircleLine,RiArticleLine } from "@remixicon/react";


export default () => {
  return (
    <div className="mx-auto max-w-52 flex items-center">
      <a href="https://wa.me/541123913064" target="_blank" className="mt-1 mx-auto">
        <RiWhatsappLine size={30} className=" text-green-600" />
      </a>
      <a href="https://www.instagram.com/bexo.com.ve" target="_blank" className="mt-1 mx-auto">
      <RiInstagramLine size={30} className="mt-1 mx-auto text-pink-500" />
      </a>
      <a href="https://www.facebook.com/100092000640446" target="_blank" className="mt-1 mx-auto">
      <RiFacebookCircleLine size={30} className="mt-1 mx-auto text-blue-900" />
      </a>
      <a href="https://blog.bexo.com.ve" target="_blank" className="mt-1 mx-auto">
      <RiArticleLine size={30} className=" text-orange-500" />
      </a>
    </div>
    
  );
};
