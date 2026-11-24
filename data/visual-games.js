'use strict';
const LOGOS = [
['netflix','Netflix','netflix'],['spotify','Spotify','spotify'],['youtube','YouTube','youtube'],['instagram','Instagram','instagram'],['tiktok','TikTok','tiktok'],['playstation','PlayStation','playstation'],['xbox','Xbox','xbox'],['nintendo','Nintendo','nintendo'],['mcdonalds','McDonald’s','mcdonalds'],['starbucks','Starbucks','starbucks'],['adidas','Adidas','adidas'],['nike','Nike','nike'],['puma','Puma','puma'],['apple','Apple','apple'],['microsoft','Microsoft','microsoft'],['google','Google','google'],['amazon','Amazon','amazon'],['disneyplus','Disney+','disneyplus'],['primevideo','Prime Video','primevideo'],['telegram','Telegram','telegram'],['whatsapp','WhatsApp','whatsapp'],['discord','Discord','discord'],['cocacola','Coca-Cola','cocacola'],['pepsi','Pepsi','pepsi'],['lego','LEGO','lego'],['mercedes','Mercedes-Benz','mercedesbenz'],['bmw','BMW','bmw'],['ferrari','Ferrari','ferrari'],['porsche','Porsche','porsche'],['samsung','Samsung','samsung'],['ikea','IKEA','ikea'],['burgerking','Burger King','burgerking'],['kfc','KFC','kfc'],['visa','Visa','visa'],['mastercard','Mastercard','mastercard'],['airbnb','Airbnb','airbnb'],['uber','Uber','uber'],['steam','Steam','steam'],['roblox','Roblox','roblox'],['minecraft','Minecraft','minecraft']
].map(([id,answer,slug])=>({id:'logo-'+id,d:'easy',c:'Marka Logoları',t:'Bu logo hangi markaya ait?',answer,answers:[answer.toLocaleLowerCase('tr')],image:`https://cdn.simpleicons.org/${slug}`,o:[]}));
const FLAGS = [
['tr','Türkiye'],['us','Amerika Birleşik Devletleri'],['gb','Birleşik Krallık'],['de','Almanya'],['fr','Fransa'],['it','İtalya'],['es','İspanya'],['pt','Portekiz'],['nl','Hollanda'],['be','Belçika'],['ch','İsviçre'],['at','Avusturya'],['gr','Yunanistan'],['jp','Japonya'],['kr','Güney Kore'],['cn','Çin'],['in','Hindistan'],['br','Brezilya'],['ar','Arjantin'],['mx','Meksika'],['ca','Kanada'],['au','Avustralya'],['nz','Yeni Zelanda'],['eg','Mısır'],['za','Güney Afrika'],['ma','Fas'],['sa','Suudi Arabistan'],['ua','Ukrayna'],['se','İsveç'],['no','Norveç'],['fi','Finlandiya'],['dk','Danimarka'],['pl','Polonya'],['hr','Hırvatistan'],['rs','Sırbistan'],['is','İzlanda'],['th','Tayland'],['id','Endonezya'],['pk','Pakistan'],['cl','Şili']
].map(([code,name])=>({id:'flag-'+code,d:'easy',c:'Ülke Bayrakları',t:'Bu bayrak hangi ülkeye ait?',answer:name,answers:[name.toLocaleLowerCase('tr')],image:`https://flagcdn.com/w640/${code}.png`}));
const PEOPLE_TR = [
['Tarkan','Tarkan'],['Sezen Aksu','Sezen Aksu'],['Cem Yılmaz','Cem Yılmaz'],['Şahan Gökbakar','Şahan Gökbakar'],['Hadise','Hadise'],['Hande Erçel','Hande Erçel'],['Kenan İmirzalıoğlu','Kenan İmirzalıoğlu'],['Kıvanç Tatlıtuğ','Kıvanç Tatlıtuğ'],['Murat Boz','Murat Boz'],['Aleyna Tilki','Aleyna Tilki'],['Oğuzhan Koç','Oğuzhan Koç'],['Demet Özdemir','Demet Özdemir'],['Beren Saat','Beren Saat'],['Engin Akyürek','Engin Akyürek'],['Barış Arduç','Barış Arduç'],['Ezhel','Ezhel'],['Ceza','Ceza'],['Sagopa Kajmer','Sagopa Kajmer'],['Mabel Matiz','Mabel Matiz'],['Aras Bulut İynemli','Aras Bulut İynemli'],['Burak Özçivit','Burak Özçivit'],['Fahriye Evcen','Fahriye Evcen'],['Şebnem Ferah','Şebnem Ferah'],['Müslüm Gürses','Müslüm Gürses'],['Barış Manço','Barış Manço']
];
const PEOPLE_WORLD = [
['Leonardo DiCaprio','Leonardo DiCaprio'],['Taylor Swift','Taylor Swift'],['Cristiano Ronaldo','Cristiano Ronaldo'],['Lionel Messi','Lionel Messi'],['Dwayne Johnson','Dwayne Johnson'],['Tom Cruise','Tom Cruise'],['Brad Pitt','Brad Pitt'],['Angelina Jolie','Angelina Jolie'],['Ariana Grande','Ariana Grande'],['Beyonce','Beyoncé'],['Rihanna','Rihanna'],['Eminem','Eminem'],['Ed Sheeran','Ed Sheeran'],['Billie Eilish','Billie Eilish'],['Robert Downey Jr.','Robert Downey Jr.'],['Scarlett Johansson','Scarlett Johansson'],['Keanu Reeves','Keanu Reeves'],['Zendaya','Zendaya'],['Johnny Depp','Johnny Depp'],['Shakira','Shakira'],['Lady Gaga','Lady Gaga'],['Kylian Mbappe','Kylian Mbappé'],['Michael Jackson','Michael Jackson'],['Adele','Adele'],['Jackie Chan','Jackie Chan']
];
const FOOTBALLERS = [
['Lionel Messi','Lionel Messi'],['Cristiano Ronaldo','Cristiano Ronaldo'],['Neymar','Neymar'],['Kylian Mbappe','Kylian Mbappé'],['Erling Haaland','Erling Haaland'],['Kevin De Bruyne','Kevin De Bruyne'],['Mohamed Salah','Mohamed Salah'],['Luka Modric','Luka Modrić'],['Zinedine Zidane','Zinedine Zidane'],['Ronaldinho','Ronaldinho'],['Ronaldo Nazario','Ronaldo Nazário'],['David Beckham','David Beckham'],['Sergio Ramos','Sergio Ramos'],['Harry Kane','Harry Kane'],['Vinicius Junior','Vinícius Júnior'],['Jude Bellingham','Jude Bellingham'],['Arda Güler','Arda Güler'],['Hakan Çalhanoğlu','Hakan Çalhanoğlu'],['Kenan Yıldız','Kenan Yıldız'],['Burak Yılmaz','Burak Yılmaz'],['Alex de Souza','Alex de Souza'],['Didier Drogba','Didier Drogba'],['Andres Iniesta','Andrés Iniesta'],['Xavi','Xavi'],['Thierry Henry','Thierry Henry'],['Wayne Rooney','Wayne Rooney'],['Iker Casillas','Iker Casillas'],['Gianluigi Buffon','Gianluigi Buffon'],['Roberto Carlos','Roberto Carlos'],['Sadio Mane','Sadio Mané']
];
const personItems=(arr,prefix,cat)=>arr.map(([page,answer],i)=>({id:`${prefix}-${i}`,d:i%4===0?'medium':'easy',c:cat,t:'Fotoğraftaki kişi kim?',answer,answers:[answer.toLocaleLowerCase('tr')],page}));
const CLUBS = [
['Fenerbahçe','Fenerbahçe S.K.'],['Galatasaray','Galatasaray S.K.'],['Beşiktaş','Beşiktaş J.K.'],['Trabzonspor','Trabzonspor'],['Başakşehir','İstanbul Başakşehir F.K.'],['Bursaspor','Bursaspor'],['Göztepe','Göztepe S.K.'],['Samsunspor','Samsunspor'],['Adana Demirspor','Adana Demirspor'],['Konyaspor','Konyaspor'],
['Real Madrid','Real Madrid CF'],['Barcelona','FC Barcelona'],['Atlético Madrid','Atlético Madrid'],['Manchester United','Manchester United F.C.'],['Manchester City','Manchester City F.C.'],['Liverpool','Liverpool F.C.'],['Arsenal','Arsenal F.C.'],['Chelsea','Chelsea F.C.'],['Tottenham','Tottenham Hotspur F.C.'],['Newcastle United','Newcastle United F.C.'],
['Bayern Münih','FC Bayern Munich'],['Borussia Dortmund','Borussia Dortmund'],['Bayer Leverkusen','Bayer 04 Leverkusen'],['Paris Saint-Germain','Paris Saint-Germain F.C.'],['Juventus','Juventus FC'],['Milan','AC Milan'],['Inter','Inter Milan'],['Napoli','SSC Napoli'],['Roma','AS Roma'],['Ajax','AFC Ajax'],
['Benfica','S.L. Benfica'],['Porto','FC Porto'],['Celtic','Celtic F.C.'],['Rangers','Rangers F.C.'],['Galatasaray','Galatasaray S.K.'],['Feyenoord','Feyenoord'],['PSV','PSV Eindhoven'],['Flamengo','CR Flamengo'],['Boca Juniors','Boca Juniors'],['River Plate','Club Atlético River Plate']
].filter((x,i,a)=>a.findIndex(y=>y[0]===x[0])===i).map(([answer,page],i)=>({id:`club-${i}`,d:i%5===0?'medium':'easy',c:'Futbol Kulübü Armaları',t:'Bu futbol kulübünün arması hangi takıma ait?',answer,answers:[answer.toLocaleLowerCase('tr')],page}));
const UNIVERSE = [
['Marvel','Tony Stark’ın süper kahraman kimliği nedir?',['Iron Man','Thor','Hulk','Ant-Man'],0,'Marvel'],
['Marvel','Thanos’un amacı nedir?',['Sonsuzluk taşlarıyla evrendeki yaşamın yarısını yok etmek','Dünyayı yönetmek','Asgard’ı ele geçirmek','Zamanı durdurmak'],0,'Marvel'],
['Marvel','Kaptan Amerika’nın kalkanı hangi maddeden yapılmıştır?',['Vibranyum','Adamantiyum','Titanyum','Uru'],0,'Marvel'],
['Marvel','Thor’un çekicinin adı nedir?',['Mjolnir','Stormbreaker','Gungnir','Hofund'],0,'Marvel'],
['Marvel','Wakanda’nın kralı kimdir?',['T’Challa','M’Baku','N’Jobu','Zuri'],0,'Marvel'],
['Marvel','Doctor Strange’in mesleği nedir?',['Cerrah','Avukat','Arkeolog','Pilot'],0,'Marvel'],
['Marvel','Peter Parker hangi şehirde yaşar?',['New York','Los Angeles','Chicago','Gotham'],0,'Marvel'],
['Marvel','Guardians of the Galaxy ekibinin lideri kimdir?',['Star-Lord','Rocket','Drax','Groot'],0,'Marvel'],
['Marvel','Loki hangi mitolojik kökenden gelir?',['Asgardlı/Jotun kökenli','Kree','Skrull','Eternals'],0,'Marvel'],
['Marvel','Wanda Maximoff’un diğer adı nedir?',['Scarlet Witch','Black Widow','Captain Marvel','Phoenix'],0,'Marvel'],
['Marvel','Black Panther’in ülkesi hangisidir?',['Wakanda','Sokovia','Latveria','Genosha'],0,'Marvel'],
['Marvel','Avengers: Endgame’de zamanda yolculuk planının adı nedir?',['Time Heist','Project Insight','Ultron Protocol',' sokovia Accords'],0,'Marvel'],
['Marvel','Ant-Man’in gerçek adı nedir?',['Scott Lang','Hank Pym','Sam Wilson','Clint Barton'],0,'Marvel'],
['Marvel','Captain Marvel’ın gerçek adı nedir?',['Carol Danvers','Monica Rambeau','Hope van Dyne','Jane Foster'],0,'Marvel'],
['Marvel','Infinity taşlarından zihin taşı hangi renkle gösterilir?',['Sarı','Mavi','Mor','Yeşil'],0,'Marvel'],
['Harry Potter','Harry Potter’ın baykuşunun adı nedir?',['Hedwig','Errol','Fawkes','Crookshanks'],0,'Harry Potter'],
['Harry Potter','Hogwarts’ın dört binasından hangisi yılan sembolünü kullanır?',['Slytherin','Gryffindor','Ravenclaw','Hufflepuff'],0,'Harry Potter'],
['Harry Potter','Hermione’nin kedisinin adı nedir?',['Crookshanks','Hedwig','Scabbers','Norbert'],0,'Harry Potter'],
['Harry Potter','Dumbledore’un anka kuşunun adı nedir?',['Fawkes','Buckbeak','Aragog','Nagini'],0,'Harry Potter'],
['Yüzüklerin Efendisi','Tek Yüzük’ü kim dövmüştür?',['Sauron','Saruman','Celebrimbor','Elrond'],0,'Yüzüklerin Efendisi'],
['Yüzüklerin Efendisi','Frodo’nun yol arkadaşı Sam’in soyadı nedir?',['Gamgee','Baggins','Brandybuck','Took'],0,'Yüzüklerin Efendisi'],
['Star Wars','Darth Vader’ın doğum adı nedir?',['Anakin Skywalker','Luke Skywalker','Ben Solo','Obi-Wan Kenobi'],0,'Star Wars'],
['Star Wars','Yoda hangi türden bir varlıktır?',['Türü filmde belirtilmez','Wookiee','Twi’lek','Ewok'],0,'Star Wars'],
['DC','Batman’in yaşadığı şehir hangisidir?',['Gotham','Metropolis','Central City','Star City'],0,'DC'],
['DC','Superman’in Krypton’daki doğum adı nedir?',['Kal-El','Jor-El','Clark Kent','Zod'],0,'DC'],
['Dizi','Breaking Bad’de Walter White’ın takma adı nedir?',['Heisenberg','Saul Goodman','Tuco','Gus'],0,'Breaking Bad'],
['Dizi','Friends dizisinde kahvehanenin adı nedir?',['Central Perk','MacLaren’s','Monk’s Cafe','Luke’s'],0,'Friends'],
['Dizi','Sherlock dizisinde Sherlock’un ev adresi nedir?',['221B Baker Street','10 Downing Street','12 Grimmauld Place','4 Privet Drive'],0,'Sherlock'],
['Dizi','The Office’in ABD versiyonunda şirketin adı nedir?',['Dunder Mifflin','Sterling Cooper','Wayne Enterprises','Pied Piper'],0,'The Office'],
['Dizi','Game of Thrones’ta Stark ailesinin mottosu nedir?',['Winter is Coming','Fire and Blood','Hear Me Roar','Ours is the Fury'],0,'Game of Thrones'],
['Dizi','Stranger Things’in geçtiği kasaba hangisidir?',['Hawkins','Riverdale','Sunnydale','Derry'],0,'Stranger Things'],
['Dizi','Peaky Blinders’ın merkezindeki aile hangi şehirdendir?',['Birmingham','Londra','Manchester','Liverpool'],0,'Peaky Blinders'],
['Dizi','The Witcher’da Geralt’ın mesleği nedir?',['Canavar avcısı','Büyücü','Kral','Simyacı'],0,'The Witcher'],
['Dizi','La Casa de Papel’de Profesör’ün gerçek adı nedir?',['Sergio Marquina','Andrés de Fonollosa','Aníbal Cortés','Agustín Ramos'],0,'La Casa de Papel'],
['Dizi','How I Met Your Mother’da Ted’in mesleği nedir?',['Mimar','Doktor','Avukat','Öğretmen'],0,'How I Met Your Mother']
].map(([series,t,o,v,c],i)=>({id:'universe-'+i,d:i%4===0?'hard':'medium',c,t,o,v,x:`Doğru cevap: ${o[v]}`}));
module.exports={LOGOS,FLAGS,PEOPLE_TR:personItems(PEOPLE_TR,'trperson','Türk Ünlüler'),PEOPLE_WORLD:personItems(PEOPLE_WORLD,'worldperson','Yabancı Ünlüler'),FOOTBALLERS:personItems(FOOTBALLERS,'footballer','Futbolcular'),CLUBS,UNIVERSE};
