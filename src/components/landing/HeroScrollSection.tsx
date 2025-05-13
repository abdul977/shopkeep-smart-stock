"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { useStore } from "@/contexts/StoreContext";
import { DashboardSvg } from "./LandingSvgs";

export function HeroScrollSection() {
  const { storeSettings } = useStore();
  const storeName = storeSettings?.storeName || "ShopKeep Smart Stock";

  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-white">
              Boost your <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
                inventory management
              </span>
            </h1>
            <p className="text-xl mt-4 text-blue-100/80 max-w-3xl mx-auto">
              {storeName} helps you track inventory, manage products, and boost sales with
              powerful analytics and a user-friendly interface.
            </p>
          </>
        }
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto transform hover:scale-105 transition-transform duration-500">
            <DashboardSvg />
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
