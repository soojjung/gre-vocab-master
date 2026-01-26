import { useNavigate } from "react-router-dom";
import { BackHeader } from "@/components/BackHeader";

interface LicenseInfo {
  name: string;
  version?: string;
  license: string;
  url?: string;
}

const licenses: LicenseInfo[] = [
  { name: "React", version: "19.x", license: "MIT License", url: "https://github.com/facebook/react" },
  { name: "Vite", version: "7.x", license: "MIT License", url: "https://github.com/vitejs/vite" },
  { name: "Tailwind CSS", version: "4.x", license: "MIT License", url: "https://github.com/tailwindlabs/tailwindcss" },
  { name: "Lucide React", license: "ISC License", url: "https://github.com/lucide-icons/lucide" },
  { name: "React Router", version: "7.x", license: "MIT License", url: "https://github.com/remix-run/react-router" },
  { name: "Supabase", version: "2.x", license: "MIT License", url: "https://github.com/supabase/supabase-js" },
  { name: "Sonner", license: "MIT License", url: "https://github.com/emilkowalski/sonner" },
];

const licenseTexts: Record<string, string> = {
  "MIT License": `MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`,

  "ISC License": `ISC License

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.`,

  "Apache 2.0 License": `Apache License, Version 2.0

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.`,
};

export function LicensePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <BackHeader title="라이선스 및 출처" onBack={() => navigate("/mypage")} />

      <div className="px-5 py-6 pt-[calc(5rem+env(safe-area-inset-top))] space-y-5">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">단어 데이터 출처</h2>
          <p className="text-sm text-gray-500">이 앱의 GRE 단어 데이터는 아래 자료를 참고하여 구성되었습니다.</p>

          <div className="bg-white rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Manhattan Prep 1000 GRE Words</h3>
              <a href="https://www.manhattanprep.com/gre/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 underline">
                https://www.manhattanprep.com/gre/
              </a>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Target Test Prep GRE Vocabulary</h3>
              <a href="https://gre.blog.targettestprep.com/gre-vocabulary/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 underline">
                https://gre.blog.targettestprep.com/gre-vocabulary/
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">오픈소스 소프트웨어</h2>
          <p className="text-sm text-gray-500">이 앱은 아래의 오픈소스 소프트웨어를 사용하고 있습니다.</p>

          {licenses.map((lib) => (
            <div key={lib.name} className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  {lib.name} {lib.version && <span className="text-gray-400 text-sm">({lib.version})</span>}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{lib.license}</span>
              </div>
              {lib.url && (
                <a href={lib.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 underline">
                  {lib.url}
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">라이선스 전문</h2>

          {Object.entries(licenseTexts).map(([name, text]) => (
            <div key={name} className="bg-white rounded-2xl p-5">
              <h3 className="font-medium text-gray-900 mb-3">{name}</h3>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{text}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
