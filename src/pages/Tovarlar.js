import { useEffect, useState } from "react";
import "../css/Tavarlar.css";
import axios from "axios";

function Tovarlar() {
    const [stock, setStock] = useState([]);

    function getStock() {
        axios.get("http://localhost:8080/api/products")
            .then((res) => {
                setStock(res.data);
            })
            .catch((err) => {
                console.error(err);
            });

    }

    useEffect(() => {
        getStock();

    }, []);

    return (
        <div className="containerr">
            <h1 className="title">Tovarlar ro'yxati</h1>

            <table className="modern-table">
                <thead>
                <tr>
                    <th>Code</th>
                    <th>Miqdor</th>
                    <th>Ism</th>
                </tr>
                </thead>

                <tbody>
                {stock.map((item) => (
                    <tr key={item.id}>
                        <td>{item.code}</td>
                        <td>{item.meterkvadrat}</td>
                        <td>{item.name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Tovarlar;