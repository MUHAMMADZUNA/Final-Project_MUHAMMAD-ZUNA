function generateTopPerformer(
    category,
    sales,
    profit
){

    const box =
        document.getElementById(
            "topPerformer"
        );

    if(!box) return;

    box.innerHTML = `
        <h3>${category}</h3>

        <p>
            Kategori terbaik berdasarkan
            total sales.
        </p>

        <ul>
            <li>
                Sales :
                $${sales.toLocaleString()}
            </li>

            <li>
                Profit :
                $${profit.toLocaleString()}
            </li>
        </ul>
    `;
}