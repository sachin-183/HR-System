import os
import glob

replacements = {
    # Backgrounds
    "bg-slate-950": "bg-[#f8fafc]",
    "bg-slate-900": "bg-white",
    "bg-slate-900/60": "bg-white/80",
    "bg-slate-900/50": "bg-slate-50",
    "bg-slate-800": "bg-slate-50",
    "bg-slate-800/50": "bg-slate-50",
    "bg-slate-800/80": "bg-white",
    "bg-white/5": "bg-[#02adef]/5",
    "bg-white/10": "bg-[#02adef]/10",
    "bg-slate-700": "bg-slate-200",
    
    # Text
    "text-white": "text-[#01285e]",
    "text-slate-300": "text-slate-700",
    "text-slate-400": "text-slate-500",
    "text-slate-500": "text-slate-600",
    "text-blue-400": "text-[#02adef]",
    "text-purple-400": "text-[#01285e]",
    "from-white": "from-[#01285e]",
    "to-slate-400": "to-slate-600",
    
    # Gradients and special text
    "from-blue-400 to-purple-400": "from-[#02adef] to-[#01285e]",
    "from-blue-200": "from-[#02adef]",
    
    # Borders
    "border-white/10": "border-slate-200",
    "border-white/5": "border-slate-100",
    "border-slate-700": "border-slate-200",
    "border-slate-600": "border-slate-300",
    
    # Selection and Hover
    "hover:text-white": "hover:text-[#01285e]",
    "hover:bg-white/5": "hover:bg-[#02adef]/10",
    
    # Specific buttons/badges from original dark theme
    "bg-blue-600": "bg-[#02adef]",
    "hover:bg-blue-500": "hover:bg-[#0295d1]",
    "bg-slate-800/40": "bg-white/90",
    "shadow-blue-500/20": "shadow-[#02adef]/20",
    "border-blue-500/50": "border-[#02adef]/50",
    
    # Overwrite custom hardcoded btn texts that turn to navy on white bg
    "btn text-white": "btn text-white", # Keep btn text white for primary buttons, we will handle `btn` class in CSS
}

directory = r"d:\HR Recruitment\frontend\src\app\**\*.tsx"
files = glob.glob(directory, recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        if old != "btn text-white": # Avoid double replacing text-white
            new_content = new_content.replace(old, new)
            
    # Fix broken explicit white buttons
    new_content = new_content.replace("text-[#01285e] font-bold", "text-[#01285e] font-bold")
    new_content = new_content.replace('className="btn bg-[#02adef] hover:bg-[#0295d1] text-[#01285e]', 'className="btn bg-[#02adef] hover:bg-[#0295d1] text-white')
    new_content = new_content.replace('className="btn bg-green-600 hover:bg-green-500 text-[#01285e]', 'className="btn bg-green-600 hover:bg-green-500 text-white')
    new_content = new_content.replace('className="btn bg-indigo-600 hover:bg-indigo-500 text-[#01285e]', 'className="btn bg-indigo-600 hover:bg-indigo-500 text-white')
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")

print("Done.")
