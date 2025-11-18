"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var services, _i, services_1, service;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Seeding services...');
                    services = [
                        {
                            slug: 'web-design',
                            name: 'Responsive Web Design',
                            price: 2999,
                            description: 'Custom, conversion-optimized website',
                            features: [
                                'Custom responsive design',
                                'Up to 10 pages',
                                'SEO optimization',
                                'Mobile-first approach',
                                '3 rounds of revisions',
                                'Contact form integration',
                                '30 days post-launch support'
                            ],
                            sortOrder: 1,
                            active: true,
                            popular: false
                        },
                        {
                            slug: 'digital-advertising',
                            name: 'Digital Advertising Campaign',
                            price: 1999,
                            description: 'Data-driven ads for measurable growth',
                            features: [
                                '30-day campaign management',
                                'Facebook & Instagram ads',
                                'Google Ads setup',
                                'Audience targeting & research',
                                'A/B testing',
                                'Weekly performance reports',
                                'Ad creative design (up to 5)'
                            ],
                            sortOrder: 2,
                            active: true,
                            popular: false
                        },
                        {
                            slug: 'mobile-app',
                            name: 'Mobile App Development',
                            price: 9999,
                            description: 'Bringing your app idea to life',
                            features: [
                                'iOS & Android development',
                                'Custom UI/UX design',
                                'Up to 15 screens',
                                'Backend API integration',
                                'Push notifications',
                                'App store submission',
                                '60 days post-launch support'
                            ],
                            sortOrder: 3,
                            active: true,
                            popular: false
                        },
                        {
                            slug: 'ai-implementation',
                            name: 'AI Implementation Services',
                            price: 4999,
                            description: 'Integrate smart AI into your business',
                            features: [
                                'AI chatbot implementation',
                                'Custom AI model training',
                                'Process automation',
                                'Data analysis & insights',
                                'Integration with existing systems',
                                'Staff training',
                                'Ongoing optimization'
                            ],
                            sortOrder: 4,
                            active: true,
                            popular: false
                        },
                        {
                            slug: 'full-service',
                            name: 'Full Service Package',
                            price: 14999,
                            description: 'Complete digital transformation',
                            features: [
                                'Everything from all packages',
                                'Priority support',
                                'Dedicated project manager',
                                'Monthly strategy sessions',
                                'Advanced analytics dashboard',
                                'Quarterly optimization',
                                '1 year of support & maintenance'
                            ],
                            sortOrder: 5,
                            active: true,
                            popular: true
                        }
                    ];
                    _i = 0, services_1 = services;
                    _a.label = 1;
                case 1:
                    if (!(_i < services_1.length)) return [3 /*break*/, 4];
                    service = services_1[_i];
                    return [4 /*yield*/, prisma.service.upsert({
                            where: { slug: service.slug },
                            update: service,
                            create: service,
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('✅ Services seeded successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('Error seeding services:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
