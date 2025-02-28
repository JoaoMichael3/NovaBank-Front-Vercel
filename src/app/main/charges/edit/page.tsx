"use client";

import React from "react";
import ActionsSection from "../components/actionSection";
import ChargeDetailsSection from "../components/ChargeDetailsSection";
import FileUploadComponent from "../components/fileUpload";
import InterestFineDiscountForm from "../components/interestFineDiscountForm";
import NotificationSection from "../components/NotificationSection";

const EditCharge: React.FC = () => {
  return (
    <div className="gap-3">
      <ActionsSection />
      <ChargeDetailsSection />
      <section className="border border-solid rounded-lg border-gray-500 m-5 p-5">
        <InterestFineDiscountForm />
      </section>
      <section className="border border-solid rounded-lg border-gray-500 m-5 p-5">
        <FileUploadComponent />
      </section>
      <NotificationSection />
    </div>
  );
};

export default EditCharge;
