import Link from "next/link";
import Image from "next/image";
import NotFoundImage from "@/assets/images/404.png";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#843ea0] flex flex-col gap-y-5 items-center justify-center">
      <div className="w-full md:w-1/2">
        <Link href="/main">
          {" "}
          <Image src={NotFoundImage} alt="404" />
        </Link>
      </div>
      <p className="text-center font-roboto w-full md:max-w-1/2">
        Desculpe, nós não conseguimos encontrar a página que você está
        procurando
      </p>
    </div>
  );
};

export default NotFound;
