import { Product } from '#src/lib/products.server.ts'

const postPurchaseInstructions = `
Thank you so much for purchasing the Dava Line. I hope you enjoy the route.

There are two installation options:
- **Installer (recommended):** Download and run the _Rails Developments Installer_ for your operating system.
This will ensure that you have all the required dependencies and install the files to the correct location.
- **Manual (discouraged):** Download the individual files and copy them into your Train Simulator directory.
No support is provided for this method however.


Please refer to the _Route Manual_ for further details.

Any issues, comments, or feedback? Get in touch: hello@hamishweir.uk
`

const tsDependencies = [
    {
        provider: 'RSDerek',
        product: 'WVR',
        label: 'Weardale & Teesdale Network Route Add-On',
        url: 'https://store.steampowered.com/app/277777/Train_Simulator_Weardale_Teesdale_Network_Route_AddOn/',
    },
    {
        provider: 'todo',
        product: 'todo',
        label: 'Western Lines of Scotland Route Add-On',
        url: 'https://store.steampowered.com/app/222554/Train_Simulator_Western_Lines_of_Scotland_Route_AddOn/',
    },
    {
        provider: 'todo',
        product: 'todo',
        label: 'RSC EU Assets Pack (bundled with many routes)',
        url: 'https://steamdb.info/app/208300/subs/',
    },
    {
        provider: 'AP',
        product: 'APVeg',
        label: 'Armstrong Powerhouse Vegetation Enhancement Pack',
        url: 'https://armstrongpowerhouse.com/enhancements/general/vegetation_enhancement_pack',
    },
]

export default {
    name: 'Dava Line',
    slug: 'rd-dava',
    public: true,
    excerpt: 'test',
    media: {
        banner: 'https://s3.finch.hamishweir.uk/public/rails_north_east/dava/dev/dallas_dhu_01.jpg',
        gallery: [],
    },
    created: '2026-06-10T00:00:00Z',
    published: '2026-06-10T00:00:00Z',
    stripePriceId: 'price_1T0LBKIqdfED53D6B17D0slE',
    requirements: tsDependencies.map((dep) => ({
        type: 'external',
        id: dep.label,
        href: [dep.url],
        site: new URL(dep.url).hostname,
    })),
    files: [
        {
            label: 'Rails Developments Installer (Windows)',
            type: 'direct',
            href: 'https://s3.hamishweir.uk/installer_win',
            visibility: 'purchased',
            tags: ['installer'],
        },
        {
            label: 'Rails Developments Installer (Mac)',
            type: 'direct',
            href: 'https://s3.hamishweir.uk/installer_mac',
            visibility: 'purchased',
            tags: ['installer'],
        },
        {
            label: 'Rails Developments Installer (Linux)',
            type: 'direct',
            href: 'https://s3.hamishweir.uk/installer_appimage',
            visibility: 'purchased',
            tags: ['installer'],
        },
        {
            label: 'Route Manual (PDF)',
            type: 'direct',
            href: 'https://s3.hamishweir.uk/manual.pdf',
            visibility: 'public',
            tags: ['manual', 'document'],
        },
        {
            label: 'Route Manual (HTML)',
            type: 'direct',
            href: 'https://s3.hamishweir.uk/manual.html',
            visibility: 'public',
            tags: ['manual'],
        },
        {
            label: 'RD North East Common',
            type: 'bucket',
            host: '',
            key: 'RD_North_East_Common',
            bucket: 'test',
            visibility: 'purchased',
            tags: ['ts_package'],
            meta: { tsDependencies },
        },
        {
            label: 'RD North East Dava',
            type: 'bucket',
            host: '',
            key: 'RD_North_East_Dava',
            bucket: 'test',
            visibility: 'purchased',
            tags: ['ts_package'],
            meta: { tsDependencies },
        },
        {
            label: 'RD North East Dava Scenario Pack (default stock)',
            type: 'bucket',
            host: '',
            key: 'RD_North_East_Scenarios_Default',
            bucket: 'test',
            visibility: 'purchased',
            tags: ['ts_package'],
            meta: { tsDependencies },
        },
        {
            label: 'RD North East Dava Scenario Pack (extended stock)',
            type: 'bucket',
            host: '',
            key: 'RD_North_East_Scenarios_Extended',
            bucket: 'test',
            visibility: 'purchased',
            tags: ['ts_package'],
            meta: { tsDependencies },
        },
        {
            label: 'RD Signal Pack 01',
            type: 'bucket',
            host: '',
            key: 'RD_SignalPack01',
            bucket: 'test',
            visibility: 'purchased',
            tags: ['ts_package'],
        },
    ],
    postPurchaseInstructions,
} satisfies Product
