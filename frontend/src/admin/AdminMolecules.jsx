import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

const AdminMolecules = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial states from URL parameters
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialSearch = searchParams.get("search") || "";

  const [molecules, setMolecules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Sync state changes to URL search params
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (currentPage > 1) params.page = currentPage.toString();
    setSearchParams(params, { replace: true });
  }, [searchQuery, currentPage, setSearchParams]);

  const fetchMolecules = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const data = await api.adminGetMolecules({
        search: searchQuery,
        page,
        limit: ITEMS_PER_PAGE,
      });
      setMolecules(data.molecules || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error("Failed to load molecules", err);
      toast.error("Failed to load molecules list.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage]);

  // Perform single fetch when search parameters or current page changes
  useEffect(() => {
    let active = true;
    
    // Defer state update using a microtask to avoid react-hooks/set-state-in-effect warning
    Promise.resolve().then(() => {
      if (active) {
        fetchMolecules(currentPage);
      }
    });

    return () => {
      active = false;
    };
  }, [fetchMolecules, currentPage]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this molecule? This will remove its association from all products.")) return;
    try {
      await api.deleteMolecule(id);
      toast.success("Molecule deleted successfully!");
      fetchMolecules();
    } catch (err) {
      console.error("Failed to delete molecule", err);
      toast.error("Failed to delete molecule.");
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-lg text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md border-b border-slate-100 dark:border-zinc-800 pb-md">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight">Molecules Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage chemical active ingredients, Generics info, and Product linkages.</p>
        </div>
        <Link
          to="/admin/molecules/new"
          className="inline-flex items-center gap-xs bg-[#004782] text-white px-lg py-sm rounded-xl font-bold text-xs hover:opacity-90 transition-all select-none cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <Plus size={14} /> Add New Molecule
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-md bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-md rounded-2xl shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search by name or chemical aliases..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-lg pr-lg py-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-sm top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-xs">
          <Loader size="md" />
        </div>
      ) : molecules.length > 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-950 text-slate-450 border-b border-slate-100 dark:border-zinc-800 font-bold select-none uppercase tracking-wider">
                  <th className="p-md">Name</th>
                  <th className="p-md">Slug</th>
                  <th className="p-md text-center">Letter</th>
                  <th className="p-md text-center">Products Count</th>
                  <th className="p-md text-center">Featured</th>
                  <th className="p-md text-center">Status</th>
                  <th className="p-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {molecules.map((mol) => (
                  <tr key={mol.id || mol._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/20 transition-all">
                    <td className="p-md">
                      <div className="space-y-xs">
                        <span className="font-extrabold text-slate-800 dark:text-zinc-150 text-xs block">{mol.name}</span>
                        {mol.aliases && mol.aliases.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-semibold italic block">({mol.aliases.join(", ")})</span>
                        )}
                      </div>
                    </td>
                    <td className="p-md text-slate-500 font-mono text-[11px]">{mol.slug}</td>
                    <td className="p-md text-center font-extrabold text-[#038076]">{mol.letter}</td>
                    <td className="p-md text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-bold">
                        {mol.productCount || 0}
                      </span>
                    </td>
                    <td className="p-md text-center">
                      <span className={`inline-flex items-center px-sm py-0.5 rounded-lg text-[10px] font-bold border ${
                        mol.isFeatured
                          ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200/50"
                          : "bg-slate-50 dark:bg-zinc-950 text-slate-400 border-slate-200/50"
                      }`}>
                        {mol.isFeatured ? "Featured" : "Standard"}
                      </span>
                    </td>
                    <td className="p-md text-center">
                      <span className={`inline-flex items-center gap-xs px-sm py-0.5 rounded-lg text-[10px] font-bold border ${
                        mol.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200/50"
                          : "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200/50"
                      }`}>
                        {mol.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-md text-right">
                      <div className="flex items-center justify-end gap-xs">
                        <button
                          onClick={() => navigate(`/admin/molecules/${mol._id || mol.id}/edit`)}
                          className="p-sm text-slate-400 hover:text-[#004782] hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                          title="Edit Molecule"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(mol._id || mol.id)}
                          className="p-sm text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                          title="Delete Molecule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 p-md select-none text-xs font-bold text-slate-400 bg-slate-50/50 dark:bg-zinc-950/20">
              <div className="flex items-center gap-xs">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-7 h-7 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="First Page"
                >
                  <ChevronsLeft size={12} />
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-7 h-7 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Previous Page"
                >
                  <ChevronLeft size={12} />
                </button>
              </div>

              <div className="flex items-center gap-xs">
                {getPageNumbers().map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                      currentPage === pNum
                        ? "bg-[#004782] text-white shadow-sm"
                        : "hover:bg-slate-100 dark:hover:bg-zinc-950 text-slate-500"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-xs">
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-7 h-7 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Next Page"
                >
                  <ChevronRight size={12} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-7 h-7 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Last Page"
                >
                  <ChevronsRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-xxl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-xs">
          <FlaskConical className="mx-auto text-slate-300 dark:text-zinc-700 mb-md animate-pulse" size={44} />
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-200">No Molecules Configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-xs">
            We couldn't find any molecules. Register a new active chemical ingredient to start mapping products.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminMolecules;
