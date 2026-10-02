const color=['Black','White','Slate','Brown'];
const products=[
 ['p01','Puma Future Rider','Shoes','Puma',8990,11990,'sneaker-puma.webp','Bestseller'],
 ['p02','Everyday Leather Bag','Bags','Heshe',12900,16900,'handbag-leather.webp','New arrival'],
 ['p03','AirPods Max','Electronics','Apple',54900,59900,'headphones.webp','Popular'],
 ['p04','The Essential Tee','Clothing','Aorus',2990,3990,'tshirt-black.webp','New arrival'],
 ['p05','Air Jordan 1','Shoes','Nike',15900,19900,'sneaker-jordan.webp','Popular'],
 ['p06','Black City Shoulder Bag','Bags','Evira Studio',9900,12900,'handbag-black.webp','Bestseller'],
 ['p07','Classic Silver Watch','Watches','Evira Studio',14900,18900,'watch-silver.webp',''],
 ['p08','Classic Black Sunglasses','Eyewear','Evira Studio',4590,5990,'sunglasses-black.webp',''],
 ['p09','AirPods','Electronics','Apple',12900,15900,'earbuds.webp','Popular'],
 ['p10','Off-White Sports Sneakers','Shoes','Evira Studio',10900,14900,'sneaker-off-white.webp','New arrival'],
 ['p11','Prada Leather Bag','Bags','Prada',29900,39900,'handbag-prada.webp',''],
 ['p12','The Gray Day Dress','Clothing','Evira Studio',7900,9900,'dress-gray.webp','Bestseller'],
 ['p13','Leather Strap Watch','Watches','Evira Studio',13900,17900,'watch-leather.webp',''],
 ['p14','Round Frame Sunglasses','Eyewear','Evira Studio',5990,7990,'sunglasses-round.webp','New arrival'],
 ['p15','HomePod Mini','Electronics','Apple',9900,11900,'speaker-mini.webp',''],
 ['p16','Classic Frame Sunglasses','Eyewear','Evira Studio',4990,6990,'sunglasses-classic.webp',''],
 ['p17','iPhone 13 Pro','Electronics','Apple',69900,79900,'phone.webp',''],
 ['p18','Gold Smart Watch','Watches','Apple',24900,29900,'watch-smart.webp','Popular'],
 ['p19','MacBook Pro 14"','Electronics','Apple',159900,179900,'laptop.webp',''],
 ['p20','Black Dial Watch','Watches','Rolex',39900,44900,'watch-black-dial.webp',''],
 ['p21','Crystal Drop Earrings','Jewelry','Evira Studio',4990,6990,'earring-crystal.webp','New arrival'],
 ['p22','Tropical Earrings','Jewelry','Evira Studio',3990,4990,'earring-tropical.webp',''],
 ['p23','Classic Football','Toys','Evira Play',2990,3990,'toy-football.webp',''],
 ['p24','Baseball Glove','Toys','Evira Play',5490,6990,'toy-baseball-glove.webp',''],
] as const;
export const catalog=products.map((p,i)=>({id:p[0],name:p[1],category:p[2],brand:p[3],price:p[4],originalPrice:p[5],image:'/images/'+p[6],images:JSON.stringify(['/images/'+p[6],...(p[0]==='p01'?['/images/sneaker-puma-2.webp']:p[0]==='p06'?['/images/handbag-black-2.webp']:[])]),tag:p[7],stock:80,sold:8234-i*211,rating:Math.round((4.6+(i%4)*.1)*10)/10,sizes:JSON.stringify(p[2]==='Shoes'?['38','39','40','41','42','43','44']:p[2]==='Clothing'?['XS','S','M','L','XL']:['One size']),colors:JSON.stringify(p[2]==='Shoes'?['Original','Black','White']:p[2]==='Electronics'?['Original','Silver','Black']:p[2]==='Clothing'?['Original','Black','Slate']:['Original',...color.slice(0,2)]),description:p[2]==='Shoes'?'Comfort meets character. A cushioned sole, supportive fit and distinctive silhouette make this pair an everyday favorite. Select your usual EU size.':p[2]==='Bags'?'Room for everything you need, with thoughtful compartments and an effortless silhouette. Made for workdays, weekends and every plan in between.':p[2]==='Clothing'?'An easy everyday piece with a comfortable fit and a clean finish. Choose your usual size. Follow the care label to keep it looking its best.':p[2]==='Electronics'?'Bring more to your everyday with considered design and dependable performance. Explore the product details and choose the finish that suits you.':'A considered finishing touch. Clean lines, a comfortable fit and a timeless profile make it an easy addition to your everyday.'}));
export const shippingMethods=[{id:'economy',name:'Economy',days:'5–7 business days',price:500},{id:'regular',name:'Regular',days:'3–5 business days',price:1000},{id:'cargo',name:'Cargo',days:'2–3 business days',price:1500},{id:'express',name:'Express',days:'1–2 business days',price:2000}];
export const coupons=[{code:'WELCOME30',title:'30% off your first order',percent:30,max:5000,min:2000,firstOnly:true},{code:'EVIRA10',title:'10% off your order',percent:10,max:3000,min:5000,firstOnly:false},{code:'FREESHIP',title:'Free standard shipping',percent:0,max:0,min:10000,firstOnly:false}];
