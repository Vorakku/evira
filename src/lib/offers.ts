export const offers=[
 {code:'WELCOME30',eyebrow:'JUST FOR YOU',value:'30%',title:'Your first favorite.',description:'Thirty percent off your first order.',terms:'First order only · Minimum $20 · Up to $50 off',image:'/images/hero.jpg',alt:'Fashion portrait in a striped top',kind:'portrait' as const},
 {code:'EVIRA10',eyebrow:'A LITTLE EXTRA',value:'10%',title:'Tune into your day.',description:'Ten percent off orders of $50 or more.',terms:'Minimum $50 · Up to $30 off',image:'/images/headphones.webp',alt:'Wireless over-ear headphones',kind:'product' as const},
 {code:'FREESHIP',eyebrow:'KEEP MOVING',value:'Free',title:'A fresh pair. A fresh start.',description:'Free standard shipping on orders of $100 or more.',terms:'Standard shipping only · Minimum $100',image:'/images/sneaker-puma.webp',alt:'Puma everyday sneakers',kind:'product' as const},
] as const;
export const freeShippingOffer=offers.find(offer=>offer.code==='FREESHIP')!;
export const freeShippingMinimum=10000;
