import React from "react";
import Button from "@/components/button";

const ActionsSection: React.FC = () => {
  return (
    <section className="flex flex-col items-center border-solid border-[#858585] m-5 p-5 border-[1px] rounded-lg">
      <div className="flex flex-col items-center w-full">
        <div className="w-full flex justify-start mb-6 h-10 border-l-8 items-center border-[#9D54BD]  border-solid">
          <p className="text-[#ddd] font-roboto text-[26px] ml-3 font-semibold">Ações</p>
        </div>
        <ul className="flex flex-col gap-3 items-center w-full md:flex-row md:justify-center md:gap-4">
          <li className="w-full md:w-auto ">
            <Button
              text="Confirmar Pagamento"
              color="bg-gray-600"
              hoverColor="hover:bg-gray-500"
              type="button"
            />
          </li>
          <li className="w-full md:w-auto">
            <Button
              text="Confirmar Recebimento"
              color="bg-gray-600"
              hoverColor="hover:bg-gray-500"
              type="button"
            />
          </li>
          <li className="w-full md:w-auto">
            <Button
              text="Forçar Vencimento"
              color="bg-gray-600"
              hoverColor="hover:bg-gray-500"
              type="button"
            />
          </li>
          <li className="w-full md:w-auto">
            <Button
              text="Estornar Cobrança"
              color="bg-gray-600"
              hoverColor="hover:bg-gray-500"
              type="button"
            />
          </li>
          <li className="w-full md:w-auto">
            <Button
              text="Excluir Cobrança"
              color="bg-gray-600"
              hoverColor="hover:bg-gray-500"
              type="button"
            />
          </li>
        </ul>
      </div>
    </section>
  );
};

export default ActionsSection;
