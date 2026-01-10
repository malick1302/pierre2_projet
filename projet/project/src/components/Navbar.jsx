export default function Navbar() {
    return (
        <div className="flex flex-row justify-between  m-[18px] md:m-[28px] items-center px-roar-x-mobile md:px-roar-x-desktop ">
            {/* Titre principal */}
            <h1
                onClick={() => window.location.href = "/Projects"}
                className="font-HelveticaNeue font-[500] text-[16px] md:text-[32px] cursor-pointer"
                style={{ fontFamily: "'HelveticaNeue', 'Helvetica', 'Arial', sans-serif" }}
            >
                {/* ✅ ROAR en Medium */}
                <span className="text-[30px] md:text-[50px] font-medium">ROAR </span>
                <span className="text-[16px] md:text-[32px] font-[400]">music </span>
                <span className="text-[12px] md:text-[24px] font-[400]">& </span>
                <span className="text-[16px] md:text-[32px] font-[400]">sound</span>

            </h1>

            {/* ✅ Info en Medium (pas de font-[950]) */}
            <h2
                onClick={() => window.location.href = "/About"}
                className="font-HelveticaNeue font-medium text-[30px] md:text-[50px] cursor-pointer"
                style={{ fontFamily: "'HelveticaNeue', 'Helvetica', 'Arial', sans-serif" }}
            >
                Info
            </h2>
        </div>
    );
}