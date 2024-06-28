import { RiWhatsappLine, RiInstagramLine, RiFacebookCircleLine,RiArticleLine } from "@remixicon/react";


export default () => {
  return (
    <div className="mx-auto max-w-52 flex items-center ">
      <a href="https://wa.me/541123913064" target="_blank" className="mt-1 mx-auto ">
        <RiWhatsappLine size={32} className=" text-green-600" />
      </a>
      <a href="https://www.instagram.com/bexo.com.ve" target="_blank" className="mt-1 mx-auto ">
      <RiInstagramLine size={32} className="mt-1 mx-auto text-pink-500" />
      </a>
      <a href="https://www.facebook.com/100092000640446" target="_blank" className="mt-1 mx-auto ">
      <RiFacebookCircleLine size={32} className="mt-1 mx-auto text-blue-900" />
      </a>
      {/* <a href="https://blog.bexo.com.ve" target="_blank" className="mt-1 mx-auto hotspot">
      <RiArticleLine size={30} className=" text-pink-500" />
      <span className="hotspot-icon">.</span>      
      </a> */}
      
      <a 
        href="https://blog.bexo.com.ve" 
        target="_blank" 
        className="mt-2 mx-auto hotspot group "
      >
        <RiArticleLine size={32} className="text-pink-500" />
        <span className="hotspot-icon">!</span>
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full mt-8 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2">
          Nuevo BLOG
        </div>
      </a>
    
    </div>
    
  );
};

