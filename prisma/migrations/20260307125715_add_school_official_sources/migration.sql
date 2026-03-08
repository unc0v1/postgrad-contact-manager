-- CreateTable
CREATE TABLE "SchoolOfficialSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolName" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolOfficialSource_baseUrl_key" ON "SchoolOfficialSource"("baseUrl");

-- CreateIndex
CREATE INDEX "SchoolOfficialSource_schoolName_isActive_priority_idx" ON "SchoolOfficialSource"("schoolName", "isActive", "priority");

-- CreateIndex
CREATE INDEX "SchoolOfficialSource_domain_isActive_idx" ON "SchoolOfficialSource"("domain", "isActive");

-- SeedData
INSERT OR IGNORE INTO "SchoolOfficialSource" (
    "id",
    "schoolName",
    "siteName",
    "baseUrl",
    "domain",
    "description",
    "priority",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES
    (
        'school_source_xzdx_home',
        '西藏大学',
        '学校官网',
        'https://www.utibet.edu.cn/',
        'utibet.edu.cn',
        '学校主站首页，适合作为院校检索的官方兜底入口。',
        220,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'school_source_xzdx_graduate',
        '西藏大学',
        '研究生院',
        'https://yjsy.utibet.edu.cn/',
        'yjsy.utibet.edu.cn',
        '研究生院入口，适合检索导师、招生公告与培养通知。',
        260,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'school_source_shzu_home',
        '石河子大学',
        '学校官网',
        'https://www.shzu.edu.cn/',
        'shzu.edu.cn',
        '学校主站首页，作为官方入口兜底使用。',
        220,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'school_source_shzu_graduate',
        '石河子大学',
        '研究生招生信息网',
        'https://yjsh.shzu.edu.cn/',
        'yjsh.shzu.edu.cn',
        '研究生招生入口，适合检索招生与导师相关页面。',
        260,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'school_source_nxdx_home',
        '宁夏大学',
        '学校官网',
        'https://www.nxu.edu.cn/',
        'nxu.edu.cn',
        '学校主站首页，提升冷门院校检索稳定性。',
        220,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'school_source_nxdx_graduate',
        '宁夏大学',
        '研究生院',
        'https://graduate.nxu.edu.cn/',
        'graduate.nxu.edu.cn',
        '研究生院站点，适合检索招生通知与培养信息。',
        260,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'school_source_qhmzdx_home',
        '青海民族大学',
        '学校官网',
        'https://www.qhmu.edu.cn/',
        'qhmu.edu.cn',
        '学校主站首页，用于补齐官方源库基础入口。',
        220,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'school_source_qhmzdx_graduate',
        '青海民族大学',
        '研究生院',
        'https://yjsy.qhmu.edu.cn/',
        'yjsy.qhmu.edu.cn',
        '研究生院站点，适合检索招生简章与导师线索。',
        260,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
