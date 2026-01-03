import AppRoutes from './routes/AppRoutes';
import { Provider } from "react-redux";
import { store } from "../src/app/store/store";

function App() {

  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;
