import { useLocation, useNavigate } from "react-router-dom";

interface BoolParam {
  get(params: URLSearchParams): boolean;
  set(params: URLSearchParams, val: boolean): URLSearchParams;
}

function boolParam(name: string, def: boolean): BoolParam {
  return {
    get(params: URLSearchParams) {
      return def ? !(params.get(name) === "0") : params.get(name) === "1";
    },
    set(params: URLSearchParams, val: boolean) {
      if (def === val) {
        params.delete(name);
      } else {
        params.set(name, val ? "1" : "0");
      }
      return params;
    },
  };
}

export function useCommonChordsQuery() {
  const { search } = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(search);
  const qs = params.toString();

  const sevenths = boolParam("7ths", true);

  function setter(par: BoolParam, val: boolean) {
    par.set(params, val);

    const qs = params.toString();
    if (qs) {
      navigate(`?${qs}`);
    } else {
      navigate(window.location.pathname);
    }
  }

  return {
    sevenths: sevenths.get(params),
    qs: qs ? `?${qs}` : "",
    setSevenths: (val: boolean) => setter(sevenths, val),
  };
}
