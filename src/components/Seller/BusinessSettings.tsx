import React, { useEffect, useState } from 'react';
import {
  Store,
  MapPin,
  QrCode,
  Sparkles,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CampusUniversity, ProductCategory } from '../../types';
import { triggerConfetti } from '../../utils/confetti';
import { SproutPlusGate } from '../SproutPlusGate';
import { CouponManager } from './CouponManager';
import { BundleBuilder } from './BundleBuilder';
import { InventoryTracker } from './InventoryTracker';
import { CreateShopButton } from '../CreateShopButton';
import {
  RefreshCw,
  CalendarClock,
  Percent,
  Boxes,
  FileSpreadsheet,
  Rocket,
} from 'lucide-react';

export const BusinessSettings: React.FC = () => {
  const { activeBusiness, updateBusinessProfile } = useApp();

  const [name, setName] = useState(activeBusiness.name);
  const [tagline, setTagline] = useState(activeBusiness.tagline);
  const [description, setDescription] = useState(activeBusiness.description);
  const [university, setUniversity] = useState<CampusUniversity>(activeBusiness.university);
  const [category, setCategory] = useState<ProductCategory>(activeBusiness.category);
  const [logo, setLogo] = useState(activeBusiness.logo);
  const [banner, setBanner] = useState(activeBusiness.banner);
  const [gcashNumber, setGcashNumber] = useState(activeBusiness.gcashNumber);
  const [instagramHandle, setInstagramHandle] = useState(activeBusiness.instagramHandle || '');
  const [spots, setSpots] = useState<string[]>(activeBusiness.campusPickupSpots || []);
  const [newSpot, setNewSpot] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setName(activeBusiness.name);
    setTagline(activeBusiness.tagline);
    setDescription(activeBusiness.description);
    setUniversity(activeBusiness.university);
    setCategory(activeBusiness.category);
    setLogo(activeBusiness.logo);
    setBanner(activeBusiness.banner);
    setGcashNumber(activeBusiness.gcashNumber);
    setInstagramHandle(activeBusiness.instagramHandle || '');
    setSpots(activeBusiness.campusPickupSpots || []);
  }, [activeBusiness]);

  const handleAddSpot = () => {
    if (!newSpot.trim()) return;
    setSpots((prev) => [...prev, newSpot.trim()]);
    setNewSpot('');
  };

  const handleRemoveSpot = (idx: number) => {
    setSpots((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      name,
      tagline,
      description,
      university,
      category,
      logo,
      banner,
      gcashNumber,
      instagramHandle,
      campusPickupSpots: spots,
    });

    triggerConfetti();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#3B2F27] font-['Nunito',sans-serif]">
            Student Shop Settings
          </h2>
          <p className="text-xs text-[#7A6B5F]">
            Update your campus storefront branding, meetup spots, and GCash QR
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CreateShopButton className="btn-bouncy inline-flex items-center gap-2 rounded-xl bg-[#194E3B] hover:bg-[#0E2B25] px-4 py-2.5 text-xs font-black text-white shadow-md cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Create New Shop</span>
          </CreateShopButton>

          {isSaved && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B8E6D5] text-[#194E3B] text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile Saved!</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#EDE4D8] p-6 sm:p-8 shadow-xs space-y-5">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D]">
            Storefront Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                Business / Brand Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                Campus Base University
              </label>
              <select
                value={university}
                onChange={(e: any) => setUniversity(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              >
                <option value="MGC New Life Christian Academy">MGC New Life Christian Academy</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EDE4D8] bg-[#FAF7F2] p-3.5">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Business logo preview"
                className="w-16 h-16 rounded-2xl object-cover border border-[#D7E9D9] bg-white"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-[#3B2F27]">Business logo</p>
                <p className="mt-1 text-[10px] leading-4 text-[#7A6B5F]">Upload a square image up to 2MB. It will appear beside your shop across the marketplace.</p>
                <label className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#B8E6D5] px-3 py-2 text-[11px] font-black text-[#194E3B] cursor-pointer hover:bg-[#A3DEC9]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#54453C] mb-1">
              Tagline (One-sentence hook)
            </label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#54453C] mb-1">
              About the Founders & Craft
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
            />
          </div>
        </div>

        {/* Contact & Payments */}
        <div className="space-y-4 pt-4 border-t border-[#F0E9DF]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D]">
            Payment & Social Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                GCash Registered Number
              </label>
              <input
                type="text"
                required
                value={gcashNumber}
                onChange={(e) => setGcashNumber(e.target.value)}
                placeholder="0917-XXX-XXXX"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#54453C] mb-1">
                Instagram / TikTok Handle
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@yourshop.ph"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
            </div>
          </div>
        </div>

        {/* Campus Pickup Locations */}
        <div className="space-y-4 pt-4 border-t border-[#F0E9DF]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D]">
            Designated Campus Meetup Locations
          </h3>

          <div className="space-y-2">
            {spots.map((spot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EDE4D8] text-xs"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#207559]" />
                  <span className="font-semibold text-[#3B2F27]">{spot}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSpot(idx)}
                  className="text-[#991B1B] hover:text-[#DC2626] p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newSpot}
                onChange={(e) => setNewSpot(e.target.value)}
                placeholder="Add new spot (e.g. Science Complex Lobby)"
                className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-xs text-[#3B2F27] focus:outline-none focus:ring-2 focus:ring-[#B8E6D5]"
              />
              <button
                type="button"
                onClick={handleAddSpot}
                className="px-3 py-2 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Spot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-[#F0E9DF] flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#B8E6D5] hover:bg-[#A3DEC9] text-[#194E3B] font-black text-xs rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer btn-bouncy"
          >
            <Save className="w-4 h-4" />
            <span>Save Storefront Settings ✨</span>
          </button>
        </div>
      </form>

      {/* Sprout+ Tools */}
      <div className="bg-white rounded-3xl border border-[#EDE4D8] p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A796D]">Sprout+ Tools</h3>
          <p className="mt-1 text-[11px] text-[#7A6B5F]">Advanced tools for growing student shops</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="shrink-0 w-8 h-8 rounded-lg bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </span>
            <p className="text-xs font-bold text-[#3B2F27]">Discount & Coupon Generator</p>
          </div>
          <SproutPlusGate featureName="The coupon generator">
            <CouponManager />
          </SproutPlusGate>
        </div>

        <div className="rounded-xl border border-[#EDE4D8] bg-[#FAF7F2] p-3 flex items-center gap-2.5">
          <span className="shrink-0 w-8 h-8 rounded-lg bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </span>
          <p className="text-[11px] text-[#6B5B4F] flex-1">
            <span className="font-bold text-[#3B2F27]">Order Export</span> moved to the Orders tab — look for "Export CSV" above your order list.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="shrink-0 w-8 h-8 rounded-lg bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </span>
            <p className="text-xs font-bold text-[#3B2F27]">Bundle Builder</p>
          </div>
          <SproutPlusGate featureName="Bundle Builder">
            <BundleBuilder />
          </SproutPlusGate>
        </div>

        <div className="rounded-xl border border-[#EDE4D8] bg-[#FAF7F2] p-3 flex items-center gap-2.5">
          <span className="shrink-0 w-8 h-8 rounded-lg bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center">
            <CalendarClock className="w-4 h-4" />
          </span>
          <p className="text-[11px] text-[#6B5B4F] flex-1">
            <span className="font-bold text-[#3B2F27]">Pre-Order System</span> moved to the Products tab — look for "Sell as Pre-Order" when adding/editing a product.
          </p>
        </div>

        <div className="rounded-xl border border-[#EDE4D8] bg-[#FAF7F2] p-3 flex items-center gap-2.5">
          <span className="shrink-0 w-8 h-8 rounded-lg bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center">
            <Rocket className="w-4 h-4" />
          </span>
          <p className="text-[11px] text-[#6B5B4F] flex-1">
            <span className="font-bold text-[#3B2F27]">Product Drop Scheduler</span> moved to the Products tab — look for "Schedule a Drop" when adding/editing a product.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="shrink-0 w-8 h-8 rounded-lg bg-[#B8E6D5] text-[#194E3B] flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </span>
            <p className="text-xs font-bold text-[#3B2F27]">Real-Time Inventory Tracking</p>
          </div>
          <SproutPlusGate featureName="Inventory tracking">
            <InventoryTracker />
          </SproutPlusGate>
        </div>

      </div>
    </div>
  );
};
