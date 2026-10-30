#!/usr/bin/env node
// Chạy trong thư mục frontend:
//   node restructure-frontend.mjs --dry   (chỉ xem trước, không ghi gì)
//   node restructure-frontend.mjs         (chuyển file thật bằng git mv và sửa import)

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const DRY = process.argv.includes('--dry');
const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

if (!fs.existsSync(SRC) || !fs.existsSync(path.join(ROOT, 'package.json'))) {
    console.error('Hãy chạy trong thư mục frontend (nơi có package.json và src/).');
    process.exit(1);
}

const toPosix = (value) => value.split(path.sep).join('/');
const abs = (relative) => path.join(ROOT, relative);
const rel = (absolute) => toPosix(path.relative(ROOT, absolute));

// ---------- Cấu trúc đích ----------
const PAGE_GROUPS = {
    'src/pages/public': ['HomePage', 'DepartmentsPage', 'DoctorsPage', 'DoctorDetailPage', 'MedicalServicesPage'],
    'src/pages/auth': ['LoginPage', 'RegisterPage', 'AuthPages'],
    'src/pages/patient': ['AppointmentsPage', 'MyAppointmentsPage', 'MyExamReportsPage', 'MyPaymentsPage'],
    'src/pages/account': ['ProfilePage'],
    'src/pages/doctor': [
        'DoctorDashboardPage',
        'DoctorDashboardStats',
        'DoctorAppointmentsPage',
        'DoctorSchedulePage',
        'DoctorExamReportsPage',
        'DoctorTabs',
    ],
    'src/pages/reception': [
        'ReceptionAppointmentsPage',
        'ReceptionBillingDetailPage',
        'ReceptionBillingPage',
        'ReceptionBookingPage',
        'ReceptionPatientsPage',
        'ReceptionPages',
    ],
    'src/pages/admin': [
        'AdminDashboardPage',
        'AdminSystemConfigPage',
        'AdminUsersPage',
        'AdminDoctorsPage',
        'AdminDepartmentsPage',
        'AdminMedicalServicesPage',
        'AdminWorkingHoursPage',
        'AdminExamReportsPage',
        'AdminPage',
    ],
};

const SINGLE_MOVES = {
    'src/components/RequireRole.jsx': 'src/components/common/RequireRole.jsx',
    'src/components/RedirectStaffToPortal.jsx': 'src/components/common/RedirectStaffToPortal.jsx',
    // Chỉ ProfilePage dùng thẻ đổi mật khẩu nên đặt cạnh ProfilePage và ProfilePage.css
    'src/components/ChangePasswordCard.jsx': 'src/pages/account/ChangePasswordCard.jsx',
    // Style dùng chung của cổng bác sĩ và lễ tân (8 trang cùng import)
    'src/pages/DoctorAppointmentsPage.css': 'src/styles/staff-portal.css',
    // Layout bác sĩ và lễ tân dùng chung một file style
    'src/layouts/DoctorLayout.css': 'src/layouts/StaffLayout.css',
};

const PAGE_EXTENSIONS = ['.jsx', '.js', '.css'];
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.css']);

// ---------- Thu thập file và bản đồ di chuyển ----------
function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
    });
}

const allFiles = walk(SRC).filter((file) => SOURCE_EXTENSIONS.has(path.extname(file)));
const moveMap = new Map();

for (const [folder, names] of Object.entries(PAGE_GROUPS)) {
    for (const name of names) {
        for (const extension of PAGE_EXTENSIONS) {
            const from = abs(`src/pages/${name}${extension}`);
            if (fs.existsSync(from)) moveMap.set(from, abs(`${folder}/${name}${extension}`));
        }
    }
}

for (const [from, to] of Object.entries(SINGLE_MOVES)) {
    if (fs.existsSync(abs(from))) moveMap.set(abs(from), abs(to));
}

// ---------- Tìm và sửa đường dẫn tương đối ----------
const QUOTED_RELATIVE = /(['"])(\.{1,2}\/[^'"\n]*)\1/g;
const CSS_UNQUOTED_URL = /url\(\s*(\.{1,2}\/[^)\s'"]+)\s*\)/g;

const RESOLVE_ATTEMPTS = [
    { suffix: '', kind: 'exact' },
    { suffix: '.js', kind: 'ext' },
    { suffix: '.jsx', kind: 'ext' },
    { suffix: '.json', kind: 'ext' },
    { suffix: 'index.js', kind: 'index' },
    { suffix: 'index.jsx', kind: 'index' },
];

function isFile(target) {
    try {
        return fs.statSync(target).isFile();
    } catch {
        return false;
    }
}

function resolveOld(importer, spec) {
    const base = path.resolve(path.dirname(importer), spec);

    for (const { suffix, kind } of RESOLVE_ATTEMPTS) {
        const candidate = kind === 'index' ? path.join(base, suffix) : base + suffix;
        if (isFile(candidate)) return { file: candidate, kind };
    }

    return null;
}

function rewriteSpec(importer, spec) {
    const resolved = resolveOld(importer, spec);
    if (!resolved) return spec;

    const newImporter = moveMap.get(importer) ?? importer;
    const newTarget = moveMap.get(resolved.file) ?? resolved.file;

    if (newImporter === importer && newTarget === resolved.file) return spec;

    let target = newTarget;
    if (resolved.kind === 'ext') target = target.slice(0, target.length - path.extname(target).length);
    if (resolved.kind === 'index') target = path.dirname(target);

    let relative = toPosix(path.relative(path.dirname(newImporter), target));
    if (!relative.startsWith('.')) relative = `./${relative}`;

    return relative;
}

const plan = allFiles.map((file) => {
    const original = fs.readFileSync(file, 'utf8');
    let updated = original.replace(
        QUOTED_RELATIVE,
        (match, quote, spec) => `${quote}${rewriteSpec(file, spec)}${quote}`
    );

    if (path.extname(file) === '.css') {
        updated = updated.replace(CSS_UNQUOTED_URL, (match, spec) => `url(${rewriteSpec(file, spec)})`);
    }

    return { from: file, to: moveMap.get(file) ?? file, original, updated };
});

// ---------- Báo cáo và thực hiện ----------
const moved = plan.filter((item) => item.from !== item.to);
const rewritten = plan.filter((item) => item.updated !== item.original);

console.log(
    `${DRY ? '[XEM TRƯỚC] ' : ''}Chuyển ${moved.length} file, sửa đường dẫn trong ${rewritten.length} file.\n`
);
moved.forEach((item) => console.log(`  ${rel(item.from)}  ->  ${rel(item.to)}`));

const collisions = moved.filter((item) => fs.existsSync(item.to));

if (collisions.length > 0) {
    console.error('\nDỪNG: các đường dẫn đích đã tồn tại, chưa ghi gì:');
    collisions.forEach((item) => console.error(`  ${rel(item.to)}`));
    process.exit(1);
}

if (DRY) {
    console.log('\nChưa ghi gì. Chạy lại không có --dry để thực hiện.');
} else {
    for (const item of moved) {
        fs.mkdirSync(path.dirname(item.to), { recursive: true });

        try {
            execFileSync('git', ['mv', item.from, item.to], { stdio: 'pipe' });
        } catch {
            fs.renameSync(item.from, item.to);
        }
    }

    for (const item of rewritten) {
        fs.writeFileSync(item.to, item.updated, 'utf8');
    }
}

// ---------- Cảnh báo cần dọn thêm ----------
const pagesRoot = abs('src/pages');
const leftovers = fs.existsSync(pagesRoot)
    ? fs
          .readdirSync(pagesRoot, { withFileTypes: true })
          .filter((entry) => entry.isFile())
          .map((entry) => `src/pages/${entry.name}`)
    : [];

if (leftovers.length > 0 && !DRY) {
    console.log('\nCòn file chưa được xếp vào thư mục nào trong src/pages:');
    leftovers.forEach((name) => console.log(`  ${name}`));
}

const featureOf = (file) => {
    const match = rel(file).match(/^src\/pages\/([^/]+)\//);
    return match ? match[1] : null;
};

const crossImports = [];

for (const item of plan) {
    const fromFeature = featureOf(item.to);
    if (!fromFeature) continue;

    for (const match of item.updated.matchAll(QUOTED_RELATIVE)) {
        const target = path.resolve(path.dirname(item.to), match[2]);
        const hit = [target, `${target}.jsx`, `${target}.js`].find((candidate) => featureOf(candidate));
        const toFeature = hit ? featureOf(hit) : null;

        if (toFeature && toFeature !== fromFeature) {
            crossImports.push(`  ${rel(item.to)} -> ${rel(hit)}`);
        }
    }
}

if (crossImports.length > 0) {
    console.log('\nCác trang đang dùng chung file của vai trò khác (nên tách ra src/styles sau):');
    [...new Set(crossImports)].forEach((line) => console.log(line));
}

console.log('\nBước tiếp theo: npm run lint && npm run build');
