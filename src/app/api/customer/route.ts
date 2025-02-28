import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
      // Pegamos o header Authorization (se existir)
      const authHeader = req.headers.get("authorization") || "";
  
      // Chama a API externa
      const apiResponse = await fetch("https://67.205.164.128/customer", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      });
  
      // Converte a resposta em JSON
      const data = await apiResponse.json();
  
      // Retorna a resposta exatamente com o status original
      return NextResponse.json(data, { status: apiResponse.status });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 500,
        }
      );
    }
  }