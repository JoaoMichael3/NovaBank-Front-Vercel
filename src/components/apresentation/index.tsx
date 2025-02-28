import React from "react";
import TypingEffect from "react-typing-effect";

const Apresentation = () => {
  return (
    <div className="min-h-screen bg-[#1F1F1F] items-center justify-center w-full relative">
      <div className="bg-hero bg-cover bg-center min-h-screen flex flex-col justify-center items-center px-4 w-full z-20">
        <div className="flex flex-col gap-y-5">
          <h1 className="font-montserrat font-bold text-white text-xl md:text-5xl xl:text-7xl">
            Seja bem-vindo
          </h1>
          <h2 className="font-montserrat font-extrabold text-7xl text-[#A644CB]">
            <TypingEffect
              text={["Agiliza.app"]}
              speed={100}
              eraseSpeed={50}
              eraseDelay={2000}
              typingDelay={500}
            />
          </h2>
          <span className="font-robotoMono font-thin text-white max-w-md leading-6">
            A solução mais completa e segura em emissão de cobranças e serviços
            financeiros.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Apresentation;
