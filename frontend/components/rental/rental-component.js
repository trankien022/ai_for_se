// Function to transform vehicle data from DB to frontend format
function transformVehicle(vehicle) {
    const imageMap = {
        'md01': 'vf301.webp',
        'md02': 'vf6s001.webp',
        'md03': 'vf6plus001.webp',
        'md04': 'vf7s001.webp',
        'md05': 'vf7plus001.webp',
        'md06': 'vf8eco01.webp',
        'md07': 'vf8plus01.webp',
        'md08': 'vf9-eco-09.webp',
        'md09': 'vf9-plus-10.webp',
        'ms01': 'vffeliz2025.jpg',
        'ms02': 'vfventos.jpg',
        'ms03': 'vftheons.jpg',
        'ms04': 'verox.webp',
        'ms05': 'ventoneo.webp'
    };

    return {
        id: vehicle._id,
        name: vehicle.model,
        image: `/frontend/assets/images/${imageMap[vehicle._id] || 'default.webp'}`,
        price: vehicle.rentalPricePerDay ? vehicle.rentalPricePerDay.toLocaleString('vi-VN') : 'N/A',
        badges: ['Miễn phí sạc'],
        specs: [
            { icon: '/frontend/assets/images/car_model.svg', text: vehicle.vehicleType },
            { icon: '/frontend/assets/images/range_per_charge.svg', text: vehicle.range },
            { icon: '/frontend/assets/images/no_of_seat.svg', text: `${vehicle.seats} chỗ` },
            { icon: '/frontend/assets/images/trunk_capacity.svg', text: vehicle.features.find(f => f.includes('Dung tích cốp')) || 'N/A' }
        ]
    };
}

// Fetch vehicles from API
async function fetchVehicles(type = 'all') {
    try {
        const response = await fetch('http://localhost:3000/api/vehicles');
        const vehicles = await response.json();
        console.log('Fetched vehicles:', vehicles); // Debug
        let filtered = vehicles;
        if (type === 'cars') {
            filtered = vehicles.filter(v => v.vehicleType !== 'Xe Máy Điện');
        } else if (type === 'motorbikes') {
            filtered = vehicles.filter(v => v.vehicleType === 'Xe Máy Điện');
        }
        return filtered.map(transformVehicle);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return [];
    }
}

// Replace static cars array
let cars = [];

// Note: Loading is handled in individual HTML files

function generateRentalList(items) {
    const carList = document.querySelector('.car-list');
    carList.innerHTML = items.map(item => `
        <a class="car-item" href="../car-detail/car-detail.html?id=${item.id}">
            <div class="relative car-image">
                <div class="absolute top-1 left-1 z-2 w-full">
                    <div class="flex gap-1">
                        ${item.badges.map(badge => `<div class="px-2 py-1 text-xs font-bold rounded" style="background-color: rgb(232, 238, 252); height: 28px; line-height: 28px; border-radius: 4px; padding: 0px 8px; color: #00d287;">${badge}</div>`).join('')}
                    </div>
                </div>
                <img alt="car" loading="lazy" width="377" height="212" decoding="async" data-nimg="1" class="w-auto" src="${item.image}" style="color: transparent; width: 377px; height: 212px; object-fit: cover; display: block; margin: 0 auto;">
            </div>
            <div class="relative car-info" style="margin-top: 16px;">
                <div class="absolute left-2/4 -translate-x-2/4 -translate-y-2/4 border border-[#b4c3de] p-4 bg-white h-max w-max">
                    <div class="flex items-center text-center">
                        <div class="font-normal text-[#3c3c3c]">Chỉ từ</div>
                        <div class="font-black text-2xl mx-2 text-[#00D287]">${item.price}</div>
                        <div class="font-semibold text-md translate-y-1/4 text-[#374151]">VNĐ/Ngày</div>
                    </div>
                </div>
                <div class="flex flex-col border border-[#4b9c6b] px-4 gap-4 pt-11 pb-4 info-detail">
                    <div class="text-center font-extrabold text-2xl text-[#111827]">${item.name}</div>
                    <div class="grid grid-cols-2 gap-x-0 gap-y-3">
                        ${item.specs.map((spec, index) => `
                            <div class="flex gap-2 items-center">
                                <img alt="car" loading="lazy" width="${spec.icon.includes('car_model') || spec.icon.includes('motor_model') ? 22 : spec.icon.includes('range_per_charge') ? 19 : spec.icon.includes('no_of_seat') ? 18 : 19}" height="${spec.icon.includes('car_model') || spec.icon.includes('motor_model') ? 16 : spec.icon.includes('range_per_charge') ? 12 : spec.icon.includes('no_of_seat') ? 18 : 18}" decoding="async" data-nimg="1" src="${spec.icon}" style="color: transparent;">
                                <div class="text-sm font-medium text-[#374151]">${spec.text}</div>
                            </div>
                            ${index % 2 === 1 && index < item.specs.length - 1 ? '<hr class="col-span-2 h-px border-[#d9e1e2] m-0">' : ''}
                        `).join('')}
                    </div>
                </div>
            </div>
        </a>
    `).join('');
}

function generateRentalFilter() {
    return `
        <div class="bg-white p-4 rounded-lg max-w-full md:max-w-[343px] lg:max-w-[540px] xl:max-w-full mx-auto hidden xl:block px-0 md:px-0 py-0 mb-14">
            <div class="flex justify-start mb-4">
                <button class="rental-type-btn px-4 py-2 rounded-t-lg text-lg font-bold bg-cyan-background text-#111827">Thuê ngày</button>
                <button class="rental-type-btn px-4 py-2 rounded-t-lg text-lg font-bold ml-2 relative bg-cyan-background text-#111827">Thuê tháng
                    <div class="exclusive-badge absolute text-exclusive text-[12px]">Đặc quyền</div>
                </button>
            </div>
            <div class="tab-content">
                <div class="bg-white rounded-2xl max-w-full md:max-w-[343px] lg:max-w-[540px] mx-auto xl:max-w-full ml-1 mr-1 hidden xl:block px-0 md:px-0 py-0 mb-14">
                    <form class="flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-4">
                        <div class="relative">
                            <div class="text-xs text-heading-secondary font-bold">Ngày nhận xe</div>
                            <div class="flex space-x-1 mt-2">
                                <div class="space-y-2 flex-1 xl:flex-auto">
                                    <div class="flex items-center justify-between min-w-[140px] h-11 border-[1px] border-solid border-border-primary px-3 py-2.5 text-base bg-white cursor-pointer hover:border-brand-primary" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r3:" data-state="closed">
                                        <span>06/08/2025</span>
                                        <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6.08268 1.66667C6.08268 1.25246 5.7469 0.916672 5.33268 0.916672C4.91847 0.916672 4.58268 1.25246 4.58268 1.66667H6.08268ZM4.58268 5.00001C4.58268 5.41422 4.91847 5.75001 5.33268 5.75001C5.7469 5.75001 6.08268 5.41422 6.08268 5.00001H4.58268ZM12.7493 1.66667C12.7493 1.25246 12.4136 0.916672 11.9993 0.916672C11.5851 0.916672 11.2493 1.25246 11.2493 1.66667H12.7493ZM11.2493 5.00001C11.2493 5.41422 11.5851 5.75001 11.9993 5.75001C12.4136 5.75001 12.7493 5.41422 12.7493 5.00001H11.2493ZM3.66602 4.08334H13.666V2.58334H3.66602V4.08334ZM15.416 5.83334V15.8333H16.916V5.83334H15.416ZM13.666 17.5833H3.66602V19.0833H13.666V17.5833ZM1.91602 15.8333V5.83334H0.416016V15.8333H1.91602ZM3.66602 17.5833C2.69952 17.5833 1.91602 16.7998 1.91602 15.8333H0.416016C0.416016 17.6283 1.87109 19.0833 3.66602 19.0833V17.5833ZM15.416 15.8333C15.416 16.7998 14.6325 17.5833 13.666 17.5833V19.0833C15.4609 19.0833 16.916 17.6283 16.916 15.8333H15.416ZM13.666 4.08334C14.6325 4.08334 15.416 4.86684 15.416 5.83334H16.916C16.916 4.03841 15.4609 2.58334 13.666 2.58334V4.08334ZM3.66602 2.58334C1.87109 2.58334 0.416016 4.03841 0.416016 5.83334H1.91602C1.91602 4.86684 2.69952 4.08334 3.66602 4.08334V2.58334ZM1.16602 9.08334H16.166V7.58334H1.16602V9.08334ZM4.58268 1.66667V5.00001H6.08268V1.66667H4.58268ZM11.2493 1.66667V5.00001H12.7493V1.66667H11.2493Z" fill="#4B5563"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div class="space-y-2 flex-1 xl:flex-auto">
                                    <div class="flex items-center justify-between min-w-[140px] h-11 border-[1px] border-solid border-border-primary px-3 py-2.5 text-base bg-white cursor-pointer hover:border-brand-primary" type="button" id="radix-:r5:" aria-haspopup="menu" aria-expanded="false" data-state="closed">
                                        <span>10:00</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <g clip-path="url(#clip0_6406_8735)">
                                                <path d="M9.99996 5.83332V9.99999L8.33329 12.5M18.3333 9.99999C18.3333 14.6024 14.6023 18.3333 9.99996 18.3333C5.39759 18.3333 1.66663 14.6024 1.66663 9.99999C1.66663 5.39762 5.39759 1.66666 9.99996 1.66666C14.6023 1.66666 18.3333 5.39762 18.3333 9.99999Z" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_6406_8735">
                                                    <rect width="20" height="20" fill="white"></rect>
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="relative">
                            <div class="text-xs text-heading-secondary font-bold">Ngày trả xe</div>
                            <div class="flex space-x-1 mt-2">
                                <div class="space-y-2 flex-1 xl:flex-auto">
                                    <div class="flex items-center justify-between min-w-[140px] h-11 border-[1px] border-solid border-border-primary px-3 py-2.5 text-base bg-white cursor-pointer hover:border-brand-primary" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r8:" data-state="closed">
                                        <span>07/08/2025</span>
                                        <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6.08268 1.66667C6.08268 1.25246 5.7469 0.916672 5.33268 0.916672C4.91847 0.916672 4.58268 1.25246 4.58268 1.66667H6.08268ZM4.58268 5.00001C4.58268 5.41422 4.91847 5.75001 5.33268 5.75001C5.7469 5.75001 6.08268 5.41422 6.08268 5.00001H4.58268ZM12.7493 1.66667C12.7493 1.25246 12.4136 0.916672 11.9993 0.916672C11.5851 0.916672 11.2493 1.25246 11.2493 1.66667H12.7493ZM11.2493 5.00001C11.2493 5.41422 11.5851 5.75001 11.9993 5.75001C12.4136 5.75001 12.7493 5.41422 12.7493 5.00001H11.2493ZM3.66602 4.08334H13.666V2.58334H3.66602V4.08334ZM15.416 5.83334V15.8333H16.916V5.83334H15.416ZM13.666 17.5833H3.66602V19.0833H13.666V17.5833ZM1.91602 15.8333V5.83334H0.416016V15.8333H1.91602ZM3.66602 17.5833C2.69952 17.5833 1.91602 16.7998 1.91602 15.8333H0.416016C0.416016 17.6283 1.87109 19.0833 3.66602 19.0833V17.5833ZM15.416 15.8333C15.416 16.7998 14.6325 17.5833 13.666 17.5833V19.0833C15.4609 19.0833 16.916 17.6283 16.916 15.8333H15.416ZM13.666 4.08334C14.6325 4.08334 15.416 4.86684 15.416 5.83334H16.916C16.916 4.03841 15.4609 2.58334 13.666 2.58334V4.08334ZM3.66602 2.58334C1.87109 2.58334 0.416016 4.03841 0.416016 5.83334H1.91602C1.91602 4.86684 2.69952 4.08334 3.66602 4.08334V2.58334ZM1.16602 9.08334H16.166V7.58334H1.16602V9.08334ZM4.58268 1.66667V5.00001H6.08268V1.66667H4.58268ZM11.2493 1.66667V5.00001H12.7493V1.66667H11.2493Z" fill="#4B5563"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div class="space-y-2 flex-1 xl:flex-auto">
                                    <div class="flex items-center justify-between min-w-[140px] h-11 border-[1px] border-solid border-border-primary px-3 py-2.5 text-base bg-white cursor-pointer hover:border-brand-primary" type="button" id="radix-:ra:" aria-haspopup="menu" aria-expanded="false" data-state="closed">
                                        <span>10:00</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <g clip-path="url(#clip0_6406_8735)">
                                                <path d="M9.99996 5.83332V9.99999L8.33329 12.5M18.3333 9.99999C18.3333 14.6024 14.6023 18.3333 9.99996 18.3333C5.39759 18.3333 1.66663 14.6024 1.66663 9.99999C1.66663 5.39762 5.39759 1.66666 9.99996 1.66666C14.6023 1.66666 18.3333 5.39762 18.3333 9.99999Z" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_6406_8735">
                                                    <rect width="20" height="20" fill="white"></rect>
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex-1 w-full">
                            <div class="h-4"></div>
                            <button class="search-btn inline-flex items-center justify-center whitespace-nowrap rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-cyan-background text-white hover:bg-cyan-background/90 px-4 py-2 h-11 shadow-none w-full text-base font-bold mt-2" type="submit">Tìm kiếm xe</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="flex xl:hidden items-center justify-between space-x-2 bg-white shadow-sm rounded border-[1px] border-stroke px-3 py-2 outline-none mb-10" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:rc:" data-state="closed">
            <div class="relative space-y-1">
                <div class="text-base font-bold">Hà Nội</div>
                <div class="flex items-center text-sm space-x-1">
                    <span>ngày</span>
                    <span>•</span>
                    <span>10:00 06/08/2025</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none" class="shrink-0">
                        <path d="M1.5 6.81818C1.5 6.54203 1.72386 6.31818 2 6.31818H8.79289L6.14645 3.67173C5.95118 3.47647 5.95118 3.15989 6.14645 2.96462C6.34171 2.76936 6.65829 2.76936 6.85355 2.96462L10.3536 6.46462C10.5488 6.65988 10.5488 6.97647 10.3536 7.17173L6.85355 10.6717C6.65829 10.867 6.34171 10.867 6.14645 10.6717C5.95118 10.4765 5.95118 10.1599 6.14645 9.96462L8.79289 7.31818H2C1.72386 7.31818 1.5 7.09432 1.5 6.81818Z" fill="#7F7F7F"></path>
                    </svg>
                    <span>10:00 07/08/2025</span>
                </div>
            </div>
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" class="ml-1">
                <path d="M0.646447 0.146447C0.451184 0.341709 0.451184 0.658291 0.646447 0.853553L4.79289 5L0.646447 9.14645C0.451185 9.34171 0.451185 9.65829 0.646447 9.85355C0.841709 10.0488 1.15829 10.0488 1.35355 9.85355L5.85355 5.35355C6.04882 5.15829 6.04882 4.84171 5.85355 4.64645L1.35355 0.146447C1.15829 -0.0488155 0.841709 -0.0488155 0.646447 0.146447Z" fill="#7F7F7F"></path>
            </svg>
        </div>
    `;
}
