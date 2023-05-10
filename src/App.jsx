import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const TYPE_SORT = {
  NONE: "none",
  NAME: "name",
  LAST_NAME: "lastName",
  COUNTRY: "country",
};
function App() {
  const [users, setUsers] = useState([]);
  const [color, setColor] = useState(false);
  const [sorts, setSorts] = useState(TYPE_SORT.NONE);
  const [searchCountry, setSearchCountry] = useState(null);
  const initialUsers = useRef([]);

  useEffect(() => {
    fetch("https://randomuser.me/api/?results=100")
      .then((response) => response.json())
      .then((responseData) => {
        setUsers(responseData.results);
        initialUsers.current = responseData.results;
      });
  }, []);

  const handleColorChange = () => {
    setColor(!color);
  };
  const handleDeleteUser = (email) => {
    const newUsers = users.filter((user) => user.email !== email);
    setUsers(newUsers);
  };
  const changeInitialUsers = () => {
    setUsers(initialUsers.current);
  };
  const handleSearch = (event) => {
    setSearchCountry(event.target.value);
  };
  const toggleSortByCountry = () => {
    const newSortValue = sorts === TYPE_SORT.NONE ? TYPE_SORT.COUNTRY : TYPE_SORT.NONE
    setSorts(newSortValue)
  }

  const handleSortType = (type) => {    
    setSorts(type);
  };

  const normalizeFilters = useMemo(() => {
    return searchCountry !== null && searchCountry.length > 0
      ? users.filter((user) => {
          const normalizedInput = searchCountry
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          const normalizedElement = user.location.country
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          const regex = new RegExp(normalizedInput, "i");
          return regex.test(normalizedElement.toLowerCase());
        })
      : users;
  },[users,searchCountry]);

  const sortUsers =  useMemo(() => {
    if (sorts === TYPE_SORT.NONE) return normalizeFilters;
    if (sorts === TYPE_SORT.NAME)
      return normalizeFilters.toSorted((a, b) => a.name.first.localeCompare(b.name.first));
    if (sorts === TYPE_SORT.LAST_NAME)
      return normalizeFilters.toSorted((a, b) => a.name.last.localeCompare(b.name.last));
    if (sorts === TYPE_SORT.COUNTRY)
      return normalizeFilters.toSorted((a, b) =>
        a.location.country.localeCompare(b.location.country)
      );
  },[normalizeFilters,sorts]);

  return (
    <main>
      <header>
        <h1>Prueba técnica</h1>
        <section>
          <button onClick={handleColorChange}>Colores Files</button>
          <button onClick={() => toggleSortByCountry(TYPE_SORT.COUNTRY)}>
            {sorts === TYPE_SORT.COUNTRY
              ? "No Ordenar por pais"
              : "Ordenar por pais"}
          </button>
          <button onClick={changeInitialUsers}>Resetear estado</button>
          <input
            type="text"
            placeholder="filtrar por pais"
            onChange={handleSearch}
          />
        </section>
      </header>
      <table width="100%">
        <thead>
          <tr>
            <th>Foto</th>
            <th onClick={() => handleSortType(TYPE_SORT.NAME)} className="pointer">
              Nombre
            </th>
            <th
              onClick={() => handleSortType(TYPE_SORT.LAST_NAME)}
              className="pointer"
            >
              Apellido
            </th>
            <th
              onClick={() => handleSortType(TYPE_SORT.COUNTRY)}
              className="pointer"
            >
              Pais
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortUsers?.map((user) => (
            <tr key={user.email} className={color ? "tr-action" : null}>
              <td>
                <img src={user.picture.thumbnail} />
              </td>
              <td>{user.name.first}</td>
              <td>{user.name.last}</td>
              <td>{user.location.country}</td>
              <td>
                <button onClick={() => handleDeleteUser(user.email)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default App;
