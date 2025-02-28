import React, { useState } from "react";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import FileUpload from "@/components/fileUpload";
import CustomSelect from "@/components/select";
import CustomButton from "@/components/button";
import Image from "next/image";
import TrashIcon from "@/assets/icons/trash.svg";
import { CustomFile } from "./types"; 
import { fileTypeOptions, visibilityOptions } from "@/utils/StepThreeObjects";
interface FormValues {
  files: CustomFile[];
}

const validationSchema = Yup.object().shape({
  files: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Nome do arquivo é obrigatório"),
      fileType: Yup.string().required("Categoria é obrigatória"),
      visibility: Yup.string().required("Visibilidade é obrigatória"),
    })
  ),
});

const FileUploadComponent: React.FC = () => {
  const [files, setFiles] = useState<CustomFile[]>([]);

  const handleFileUpload = (uploadedFiles: File[], arrayHelpers: any) => {
    const newFiles: CustomFile[] = uploadedFiles.map((file, index) => ({
      id: files.length + index + 1,
      name: file.name,
      type: file.type,
      fileType: "",
      visibility: "",
    }));

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    arrayHelpers.push(...newFiles);
  };

  return (
    <Formik<FormValues>
      initialValues={{ files: [] }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
  
      }}
    >
      {({ values, setFieldValue }) => (
        <Form className="w-full">
          <FieldArray
            name="files"
            render={(arrayHelpers) => (
              <div className="flex flex-col justify-center gap-y-5">
                <p className="font-roboto font-bold text-[#ddd] border-l-8 h-8 lg:text-[26px] flex pl-3 items-center border-solid border-[#9D54BD] justify-start">
                  Documentos e arquivos da cobrança (Opcional)
                </p>
                <FileUpload
                  onFileUpload={(fileList) =>
                    handleFileUpload(Array.from(fileList), arrayHelpers)
                  }
                />
                <ol className="list-decimal w-full">
                  {values.files.map((file, index) => (
                    <li
                      key={file.id}
                      className="flex items-center gap-x-4 justify-between"
                    >
                      <p className="text-[14px] text-[#ddd] flex-shrink-0">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-x-4 flex-grow">
                        <CustomSelect
                          name={`files[${index}].fileType`}
                          options={fileTypeOptions}
                          value={file.fileType}
                          onChange={(e) =>
                            setFieldValue(
                              `files[${index}].fileType`,
                              e.target.value
                            )
                          }
                        />
                        <CustomSelect
                          name={`files[${index}].visibility`}
                          options={visibilityOptions}
                          value={file.visibility}
                          onChange={(e) =>
                            setFieldValue(
                              `files[${index}].visibility`,
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          arrayHelpers.remove(index);
                          setFiles((prevFiles) =>
                            prevFiles.filter((_, i) => i !== index)
                          );
                        }}
                        className="ml-auto flex-shrink-0 flex items-center"
                      >
                        <div className="h-[1.5rem] w-[1.5rem]">
                          <Image src={TrashIcon} alt="excluir" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ol>
                <CustomButton
                  text="Enviar"
                  color="bg-gray-600"
                  hoverColor="hover:bg-gray-500"
                  type="submit"
                />
              </div>
            )}
          />
        </Form>
      )}
    </Formik>
  );
};

export default FileUploadComponent;
