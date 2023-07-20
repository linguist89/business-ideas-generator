import './App.css';
import Header from './Header';
import BodyComponent from './BodyComponent';
import React from 'react';

export const UserContext = React.createContext(null);

function App() {
    const [user, setUser] = React.useState(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <div className="App">
                <Header></Header>
                <BodyComponent></BodyComponent>
            </div>
        </UserContext.Provider>
    );
}

export default App;
