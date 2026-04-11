"use client";

import React, { useState, useEffect } from "react";
import { Specialty } from "@/services/specialtyService";
import { Facility } from "@/services/facilityService";
import { Branch } from "@/services/branchService";
import { MedicalService } from "@/services/medicalService";

interface DoctorFilterSidebarProps {
    specialties: Specialty[];
    selectedSpecialty: string;
    setSelectedSpecialty: (val: string) => void;
    
    selectedGender: string;
    setSelectedGender: (val: string) => void;
    
    priceRange: [number, number];
    setPriceRange: (val: [number, number]) => void;

    facilities: Facility[];
    selectedFacility: string;
    setSelectedFacility: (val: string) => void;

    branches: Branch[];
    selectedBranch: string;
    setSelectedBranch: (val: string) => void;

    services: MedicalService[];
    selectedService: string;
    setSelectedService: (val: string) => void;
    
    hasFilters: boolean;
    clearFilters: () => void;
}

const MAX_PRICE = 15000000;

export function DoctorFilterSidebar({
    specialties,
    selectedSpecialty,
    setSelectedSpecialty,
    selectedGender,
    setSelectedGender,
    priceRange,
    setPriceRange,
    facilities,
    selectedFacility,
    setSelectedFacility,
    branches,
    selectedBranch,
    setSelectedBranch,
    services,
    selectedService,
    setSelectedService,
    hasFilters,
    clearFilters
}: DoctorFilterSidebarProps) {

    // Local state for smoother slider dragging
    const [localMin, setLocalMin] = useState(priceRange[0]);
    const [localMax, setLocalMax] = useState(priceRange[1]);

    useEffect(() => {
        setLocalMin(priceRange[0]);
        setLocalMax(priceRange[1]);
    }, [priceRange]);

    const formatPrice = (val: number) => {
        if (val === 0) return "0đ";
        if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace('.0', '')}Tr`;
        return `${val / 1000}K`;
    };

    const handlePriceCommit = () => {
        setPriceRange([localMin, localMax]);
    };

    const renderRadioGroup = (
        items: any[],
        selectedValue: string,
        onChange: (val: string) => void,
        allLabel: string,
        groupName: string
    ) => (
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 transition-colors">
            <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                    <input type="radio" name={groupName} value="" checked={selectedValue === ""} onChange={(e) => onChange(e.target.value)} className="peer sr-only" />
                    <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:border-[#3C81C6] peer-checked:bg-[#3C81C6] transition-colors flex items-center justify-center group-hover:border-[#3C81C6]/50">
                        <span className="material-symbols-outlined text-white text-[14px] opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all duration-200">check</span>
                    </div>
                </div>
                <span className={`text-sm ${selectedValue === "" ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900"}`}>{allLabel}</span>
            </label>
            {items.map((item, idx) => (
                <label key={item.id || idx} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                        <input type="radio" name={groupName} value={item.id} checked={selectedValue === item.id} onChange={(e) => onChange(e.target.value)} className="peer sr-only" />
                        <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:border-[#3C81C6] peer-checked:bg-[#3C81C6] transition-colors flex items-center justify-center group-hover:border-[#3C81C6]/50">
                            <span className="material-symbols-outlined text-white text-[14px] opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all duration-200">check</span>
                        </div>
                    </div>
                    <span className={`text-sm ${selectedValue === item.id ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900"}`}>{item.name}</span>
                </label>
            ))}
        </div>
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "18px" }}>tune</span>
                    Bộ lọc
                </h3>
                {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium">Xoá bộ lọc</button>
                )}
            </div>

            {/* Facility filter */}
            <div className="mb-6">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 block">Cơ sở khám</label>
                {renderRadioGroup(facilities, selectedFacility, setSelectedFacility, "Tất cả cơ sở", "facility")}
            </div>

            {/* Branch filter */}
            <div className="mb-6">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 block">Chi nhánh</label>
                {renderRadioGroup(branches, selectedBranch, setSelectedBranch, "Tất cả chi nhánh", "branch")}
            </div>

            {/* Specialty filter */}
            <div className="mb-6">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 block">Chuyên khoa</label>
                {renderRadioGroup(specialties, selectedSpecialty, setSelectedSpecialty, "Tất cả chuyên khoa", "specialty")}
            </div>

            {/* Service filter */}
            <div className="mb-6">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 block">Dịch vụ lâm sàng</label>
                {renderRadioGroup(services, selectedService, setSelectedService, "Tất cả dịch vụ", "service")}
            </div>

            {/* Gender filter */}
            <div className="mb-6">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Giới tính</label>
                <div className="flex gap-2">
                    {[{ v: "", l: "Tất cả" }, { v: "male", l: "Nam" }, { v: "female", l: "Nữ" }].map(g => (
                        <button key={g.v} onClick={() => setSelectedGender(g.v)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all border
                            ${selectedGender === g.v ? "bg-[#3C81C6] text-white border-[#3C81C6] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                            {g.l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price filter Slider */}
            <div className="mb-6 relative">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Khoảng giá</label>
                
                {/* Visual Tracker */}
                <div className="flex justify-between text-[11px] font-medium text-[#3C81C6] mb-2">
                    <span>{formatPrice(localMin)}</span>
                    <span>{formatPrice(localMax)}</span>
                </div>

                <div className="relative h-2 bg-gray-200 rounded-full mb-4">
                    {/* Active Track */}
                    <div 
                        className="absolute h-full bg-[#3C81C6] rounded-full" 
                        style={{ 
                            left: `${(localMin / MAX_PRICE) * 100}%`, 
                            right: `${100 - (localMax / MAX_PRICE) * 100}%` 
                        }} 
                    />
                    
                    {/* Thumbs using input ranges overlaid */}
                    <input 
                        type="range" 
                        min="0" max={MAX_PRICE} step="100000"
                        value={localMin}
                        onChange={(e) => {
                            const val = Math.min(Number(e.target.value), localMax - 100000);
                            setLocalMin(val);
                        }}
                        onMouseUp={handlePriceCommit}
                        onTouchEnd={handlePriceCommit}
                        className="absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#3C81C6] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                    />
                    <input 
                        type="range" 
                        min="0" max={MAX_PRICE} step="100000"
                        value={localMax}
                        onChange={(e) => {
                            const val = Math.max(Number(e.target.value), localMin + 100000);
                            setLocalMax(val);
                        }}
                        onMouseUp={handlePriceCommit}
                        onTouchEnd={handlePriceCommit}
                        className="absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#3C81C6] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">Từ</span>
                        <input type="number" 
                            className="w-full pl-6 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs" 
                            value={localMin} 
                            onChange={e => setLocalMin(Number(e.target.value))}
                            onBlur={handlePriceCommit}
                        />
                    </div>
                    <span className="text-gray-300">-</span>
                    <div className="flex-1 relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">Đến</span>
                        <input type="number" 
                            className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs" 
                            value={localMax} 
                            onChange={e => setLocalMax(Number(e.target.value))}
                            onBlur={handlePriceCommit}
                        />
                    </div>
                </div>
            </div>

            {/* Consultation type */}
            <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Hình thức</label>
                <div className="flex gap-2">
                    {[{ l: "Tất cả", i: "select_all" }, { l: "Trực tiếp", i: "person" }, { l: "Online", i: "videocam" }].map((t, i) => (
                        <button key={i} className="flex-1 flex flex-col items-center gap-1 py-2 bg-white border border-gray-200 hover:border-[#3C81C6] hover:bg-blue-50/30 rounded-xl transition-all">
                            <span className="material-symbols-outlined text-gray-500 text-[18px]">{t.i}</span>
                            <span className="text-[10px] text-gray-600 font-medium">{t.l}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
