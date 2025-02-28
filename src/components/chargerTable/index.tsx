import React from "react";
import Image from "next/image";
import { TablePropsWithFilters, statusClasses, paymentIcons } from "./types";

const ChargerTable: React.FC<TablePropsWithFilters> = ({
  title,
  linkText,
  viewAllHref,
  columns,
  data,
  filters = {},
}) => {
  const filteredData = data.filter((row: any) => {
    const matchesSearchTerm = filters.searchTerm
      ? row.Nome?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      : true;

    const matchesStatus = filters.status
      ? row.Status === filters.status
      : true;

    const matchesType = filters.type
      ? row["Forma de pagamento"]
          ?.toLowerCase()
          .includes(filters.type.toLowerCase())
      : true;

    const matchesDate =
      filters.dateRange?.start && filters.dateRange?.end
        ? new Date(row["Data de vencimento"]) >= new Date(filters.dateRange.start) &&
          new Date(row["Data de vencimento"]) <= new Date(filters.dateRange.end)
        : true;

    return matchesSearchTerm && matchesStatus && matchesType && matchesDate;
  });

  return (
    <div className="bg-[#181B21] text-white rounded-lg   w-full">
      <div
        className={`overflow-x-auto px-10  py-4 ${
          filteredData.length > 10 ? "overflow-y-auto h-[25rem]" : "h-[25rem]"
        }`}
      >
        <table className="min-w-full ">
          <thead className="border-b mb-28 border-[#6C6CBA] border-solid   bg-[#181B21] sticky top-0 ">
            <tr>
              {columns.map((column: string) => (
                <th
                  key={column}
                  className="px-10 text-[10px] md:text-md text-start  text-[#6C6BA]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row: any, index: number) => (
              <tr key={index} className="border  border-gray-200">
                {columns.map((column: string) => (
                  <td
                    key={column}
                    className="text-xs px-10 pt-3 items-start md:text-md  pb-5 border-b border-solid border-[#8c8c8d44] text-[#8C8C8D] text-start "
                  >
                    {column === "Status" ? (
                      <>
                        <span className={statusClasses[row[column] as string]}>
                          {row[column]}
                        </span>
                      </>
                    ) : column === "Forma de pagamento" ? (
                      <div className="flex items-center">
                        <Image
                          src={paymentIcons[row[column].split(" ")[0] as string]}
                          alt={row[column]}
                          width={20}
                          height={20}
                        />
                        <span className="ml-2 ">{row[column]}</span>
                      </div>
                    ) : (
                      row[column]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChargerTable;
