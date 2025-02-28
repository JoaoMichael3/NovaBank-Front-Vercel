import React, { useEffect } from "react";
import Card from "card";

const Credito: React.FC = () => {
  useEffect(() => {
    const card = new Card({
      form: "#credito-form",
      container: ".card-wrapper",
      formSelectors: {
        numberInput: "input[name='number']",
        expiryInput: "input[name='expiry']",
        cvcInput: "input[name='cvc']",
        nameInput: "input[name='name']",
      },
    });
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

  };

  return (
    <div className=" bg-white/20 backdrop-blur-sm rounded-md p-8 ">
      <div className="flex items-center mb-12">
        <span className="lg:h-10 h-8 text-transparent flex items-center bg-[#A644CB]">
          |
        </span>
        <p className="text-white lg:text-[1.5rem] text-[1.2rem] flex justify-center mt-2 ml-2">
          Pagamento por crédito
        </p>
      </div>

      <div className="card-wrapper "></div>

      <form id="credito-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="block text-sm text-[#ddd] mt-14 font-roboto font-semibold">
            Nome no Cartão
          </label>
          <input
            type="text"
            name="name"
            className="mt-1 block w-full p-2 border rounded"
            placeholder="Nome Completo"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="number" className="block text-sm text-[#ddd] font-roboto font-semibold">
            Número do Cartão
          </label>
          <input
            type="text"
            name="number"
            className="mt-1 block w-full p-2 border rounded"
            placeholder="**** **** **** ****"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="expiry" className="block text-sm text-[#ddd] font-roboto font-semibold">
            Data de Expiração
          </label>
          <input
            type="text"
            name="expiry"
            className="mt-1 block w-full p-2 border rounded"
            placeholder="MM/YY"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="cvc" className="block text-sm text-[#ddd] font-roboto font-semibold">
            CVC
          </label>
          <input
            type="text"
            name="cvc"
            className="mt-1 block w-full p-2 border rounded"
            placeholder="CVC"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-[#A644CB] text-white w-full h-11 rounded-md"
        >
          Pagar
        </button>
      </form>
    </div>
  );
};

export default Credito;
