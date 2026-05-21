// 坦克大战 —— C++ Win32/GDI 版（无外部依赖）
// 编译: build.bat
// 运行: tank.exe

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <cstdlib>
#include <ctime>
#include <vector>
#include <list>
#include <algorithm>
#include <cstdio>

// ============================================================
// 常量
// ============================================================

constexpr int SW = 800, SH = 600, CELL = 40, FPS = 60;

struct Dir { int x, y; };
const Dir UP{0,-1}, DOWN{0,1}, LEFT{-1,0}, RIGHT{1,0};
const Dir ALL_DIRS[4] = {UP, DOWN, LEFT, RIGHT};

static int rnd(int a, int b) { return a + rand() % (b - a + 1); }
static COLORREF dark(COLORREF c) {
    return RGB(max(0,GetRValue(c)-40), max(0,GetGValue(c)-40), max(0,GetBValue(c)-40));
}

// ============================================================
// 墙壁
// ============================================================

struct Wall {
    RECT rc;
    bool alive = true, steel = false;
    Wall(int x, int y, bool s=false) : steel(s) { rc = {x,y,x+CELL,y+CELL}; }
};

// ============================================================
// 前向声明
// ============================================================

struct Tank;
struct Base;
struct Bullet {
    float x, y; Dir d; int owner; bool alive = true;
    Bullet(float x, float y, Dir d, int o) : x(x), y(y), d(d), owner(o) {}
    RECT rc() const { return {(int)x-5,(int)y-5,(int)x+5,(int)y+5}; }
    void update(std::vector<Wall>&, std::list<Tank>&, Base*);
};

// ============================================================
// 坦克
// ============================================================

struct Tank {
    float x, y; int owner; COLORREF color; float spd;
    Dir d{UP}; bool alive = true; RECT rc; int cd = 0;

    Tank(float x, float y, int o, COLORREF c, float s)
        : x(x), y(y), owner(o), color(c), spd(s) { sync(); }

    void sync() { rc = {(int)x,(int)y,(int)x+CELL,(int)y+CELL}; }

    void move(int dx, int dy, std::vector<Wall>& ws, std::list<Tank>& ts) {
        if (!alive) return;
        if (dx||dy) d = {dx,dy};
        auto blocked = [&](RECT r) {
            for (auto& w : ws) if (w.alive) { RECT z; if (IntersectRect(&z,&r,&w.rc)) return true; }
            for (auto& t : ts) if (&t!=this && t.alive) {
                RECT a{r.left+2,r.top+2,r.right-2,r.bottom-2};
                RECT b{t.rc.left+2,t.rc.top+2,t.rc.right-2,t.rc.bottom-2};
                RECT z; if (IntersectRect(&z,&a,&b)) return true;
            }
            return false;
        };
        if (dx) { float nx = max(0.f,min(float(SW-CELL),x+dx*spd));
            RECT t{(int)nx,(int)y,(int)nx+CELL,(int)y+CELL};
            if (!blocked(t)) x = nx; }
        if (dy) { float ny = max(0.f,min(float(SH-CELL),y+dy*spd));
            RECT t{(int)x,(int)ny,(int)x+CELL,(int)ny+CELL};
            if (!blocked(t)) y = ny; }
        sync();
    }

    Bullet* shoot() {
        if (cd>0||!alive) return nullptr;
        cd = 15;
        return new Bullet(x+CELL/2.f+d.x*25, y+CELL/2.f+d.y*25, d, owner);
    }
};

struct Base { RECT rc; bool alive=true; Base(int x,int y) { rc={x,y,x+CELL*2,y+CELL*2}; } };

void Bullet::update(std::vector<Wall>& ws, std::list<Tank>& ts, Base* base) {
    if (!alive) return;
    x += d.x*6; y += d.y*6;
    if (x<0||x>SW||y<0||y>SH) { alive=false; return; }
    RECT r = rc();
    for (auto& w : ws) if (w.alive) { RECT z; if (IntersectRect(&z,&r,&w.rc)) {
        if (w.steel) alive=false; else { w.alive=false; alive=false; } return; }}
    for (auto& t : ts) if (t.alive && t.owner!=owner) { RECT z; if (IntersectRect(&z,&r,&t.rc)) { t.alive=false; alive=false; return; }}
    if (base) { RECT z; if (IntersectRect(&z,&r,&base->rc)) { base->alive=false; alive=false; }}
}

// ============================================================
// 地图
// ============================================================

void build_map(std::vector<Wall>& w) {
    const char* map[] = {
        "                    ","  xxxx      xxxx   ","                    ",
        " xx  xx    xx  xx  ","                    ","   xxxx    xxxx    ",
        "                    "," x  xxxx  xxxx  x  ","                    ",
        "  xxxx      xxxx   ","                    ","                    ",
    };
    for (int r=0;r<12;r++) for (int c=0;c<20;c++) if (map[r][c]=='x') w.emplace_back(c*CELL,r*CELL);
    int bx=SW/2-CELL, by=SH-CELL*3-20;
    w.emplace_back(bx-CELL*2,by,true); w.emplace_back(bx+CELL*4,by,true);
    for (int o : {CELL,CELL*2}) { w.emplace_back(bx-CELL*2,by+o,true); w.emplace_back(bx+CELL*4,by+o,true); }
    for (int ox : {-CELL,0,CELL*2,CELL*3}) w.emplace_back(bx+ox,by);
    w.emplace_back(bx+CELL,by,true);
    for (int oy : {0,CELL}) { w.emplace_back(bx-CELL,by+CELL+oy); w.emplace_back(bx+CELL*2,by+CELL+oy); }
}

// ============================================================
// 敌方 AI
// ============================================================

struct AI {
    int mt=0, st;
    AI() { st = rnd(30,90); }
    bool tick(Tank& e, std::vector<Wall>& ws, Tank& pl, std::list<Tank>& ts) {
        if (!e.alive) return false;
        mt--; st--;
        if (mt<=0) { e.d=ALL_DIRS[rand()%4]; mt=rnd(30,120); }
        if (pl.alive && rnd(0,9)==0) {
            float dx=pl.x-e.x, dy=pl.y-e.y;
            e.d = fabs(dx)>fabs(dy) ? (dx>0?RIGHT:LEFT) : (dy>0?DOWN:UP);
            mt = rnd(30,60);
        }
        e.move(e.d.x,e.d.y,ws,ts);
        if (st<=0) { st=rnd(30,90); return true; }
        return false;
    }
};

// ============================================================
// 游戏
// ============================================================

struct Game {
    HWND hwnd=0;
    std::vector<Wall> walls;
    std::list<Tank> tanks;
    std::vector<Bullet*> bullets;
    Tank* player=0;
    Base* base=0;
    AI ai;
    enum {MENU,PLAY,OVER} state=MENU;
    int score=0, lives=3, spawn_timer=0, spawned=0;
    bool win=false, r_held=false;
    static constexpr int MAX_SPAWN=8, MAX_ALIVE=3;

    ~Game() { cleanup(); }
    void cleanup() { for (auto b:bullets) delete b; bullets.clear(); delete base; base=0; tanks.clear(); walls.clear(); }

    void reset() {
        cleanup();
        score=0; lives=3; win=false; spawn_timer=0; spawned=0; r_held=false;
        build_map(walls);
        base = new Base(SW/2-CELL, SH-CELL*3-20);
        tanks.emplace_back((float)CELL*2,(float)(SH-CELL-20),0,RGB(60,200,60),3);
        player = &tanks.back();
        for (int i=0;i<2;i++) spawn();
    }

    void spawn() {
        if (spawned>=MAX_SPAWN) return;
        struct P{int x,y;} pts[3]={{CELL,CELL*2},{SW/2-CELL/2,CELL*2},{SW-CELL*2,CELL*2}};
        for (auto& p:pts) {
            RECT r{p.x,p.y,p.x+CELL,p.y+CELL}; bool ok=true;
            for (auto& t:tanks) if (t.alive) { RECT z; if (IntersectRect(&z,&r,&t.rc)) { ok=false; break; }}
            if (ok) { tanks.emplace_back((float)p.x,(float)p.y,1,RGB(220,50,50),1.5f); tanks.back().d=DOWN; spawned++; return; }
        }
    }

    // ---- 按键检测 ----
    static bool held(int vk) { return GetAsyncKeyState(vk)&0x8000; }

    // ---- 更新 ----
    void update() {
        if (state==OVER) {
            bool rp = held('R');
            if (rp && !r_held) { r_held=true; reset(); state=PLAY; }
            else if (!rp) r_held=false;
            return;
        }
        if (state!=PLAY) return;

        // ---- 玩家输入 ----
        int dx=0,dy=0;
        if (held(VK_LEFT)||held('A')) dx=-1;
        if (held(VK_RIGHT)||held('D')) dx=1;
        if (held(VK_UP)||held('W')) dy=-1;
        if (held(VK_DOWN)||held('S')) dy=1;
        player->move(dx,dy,walls,tanks);
        if (held(VK_SPACE)) { auto b=player->shoot(); if(b) bullets.push_back(b); }

        // ---- 冷却 ----
        for (auto& t:tanks) if (t.cd>0) t.cd--;

        // ---- 敌人 AI ----
        for (auto& t:tanks) if (t.owner==1 && t.alive) {
            if (ai.tick(t,walls,*player,tanks)) { auto b=t.shoot(); if(b) bullets.push_back(b); }
        }

        // ---- 子弹 ----
        for (auto b:bullets) b->update(walls,tanks,base);
        for (auto it=bullets.begin();it!=bullets.end();) {
            if (!(*it)->alive) { delete *it; it=bullets.erase(it); } else ++it;
        }

        // ---- 清理死亡坦克 ----
        for (auto it=tanks.begin();it!=tanks.end();) {
            if (!it->alive && &*it!=player) it=tanks.erase(it); else ++it;
        }

        // ---- 刷新敌人 ----
        int alive_cnt=0;
        for (auto& t:tanks) if (t.owner==1 && t.alive) alive_cnt++;
        if (alive_cnt<MAX_ALIVE && spawned<MAX_SPAWN) {
            spawn_timer++;
            if (spawn_timer>=60) { spawn(); spawn_timer=0; }
        }

        // ---- 复活 ----
        if (!player->alive && lives>0) {
            lives--;
            tanks.emplace_back((float)CELL*2,(float)(SH-CELL-20),0,RGB(60,200,60),3);
            player = &tanks.back();
        }

        // ---- 结束判定 ----
        if ((!player->alive&&lives<=0) || !base->alive) { state=OVER; win=false; }
        else if (spawned>=MAX_SPAWN) {
            bool any=false; for (auto& t:tanks) if (t.owner==1) { any=true; break; }
            if (!any) { state=OVER; win=true; }
        }
    }

    // ---- 绘制（主入口，双缓冲） ----
    void draw(HDC hdc) {
        HDC memDC = CreateCompatibleDC(hdc);
        HBITMAP bmp = CreateCompatibleBitmap(hdc, SW, SH);
        SelectObject(memDC, bmp);

        if (state == MENU) {
            draw_menu(memDC);
        } else {
            draw_scene(memDC);
            if (state == OVER) draw_overlay(memDC);
        }

        BitBlt(hdc, 0, 0, SW, SH, memDC, 0, 0, SRCCOPY);
        DeleteObject(bmp);
        DeleteDC(memDC);
    }

    void draw_scene(HDC hdc) {
        RECT cl={0,0,SW,SH};
        FillRect(hdc,&cl,(HBRUSH)GetStockObject(DKGRAY_BRUSH));

        for (auto& w:walls) if (w.alive) draw_wall(hdc,w);
        draw_base(hdc);
        for (auto& t:tanks) draw_tank(hdc,t);
        for (auto b:bullets) draw_bullet(hdc,b);
        draw_hud(hdc);
    }

    void draw_wall(HDC hdc, Wall& w) {
        if (w.steel) {
            SelectObject(hdc,GetStockObject(DC_PEN));
            SetDCPenColor(hdc,RGB(130,130,130));
            SelectObject(hdc,GetStockObject(DC_BRUSH));
            SetDCBrushColor(hdc,RGB(130,130,130));
            Rectangle(hdc,w.rc.left,w.rc.top,w.rc.right,w.rc.bottom);
            SetDCBrushColor(hdc,RGB(105,105,105));
            Rectangle(hdc,w.rc.left+2,w.rc.top+2,w.rc.right-2,w.rc.bottom-2);
            SetDCBrushColor(hdc,RGB(150,150,150));
            for (int dx:{5,CELL-5}) for (int dy:{5,CELL-5})
                Ellipse(hdc,w.rc.left+dx-3,w.rc.top+dy-3,w.rc.left+dx+3,w.rc.top+dy+3);
        } else {
            SelectObject(hdc,GetStockObject(DC_PEN));
            SetDCPenColor(hdc,RGB(180,130,70));
            SelectObject(hdc,GetStockObject(DC_BRUSH));
            SetDCBrushColor(hdc,RGB(180,130,70));
            Rectangle(hdc,w.rc.left,w.rc.top,w.rc.right,w.rc.bottom);
            SetDCBrushColor(hdc,RGB(160,110,50));
            for (int i=0;i<2;i++) for (int j=0;j<2;j++)
                Rectangle(hdc,w.rc.left+i*CELL/2+1,w.rc.top+j*CELL/2+1,
                          w.rc.left+(i+1)*CELL/2-1,w.rc.top+(j+1)*CELL/2-1);
        }
    }

    void draw_tank(HDC hdc, Tank& t) {
        if (!t.alive) return;
        SelectObject(hdc,GetStockObject(DC_PEN)); SetDCPenColor(hdc,t.color);
        SelectObject(hdc,GetStockObject(DC_BRUSH)); SetDCBrushColor(hdc,t.color);
        Rectangle(hdc,t.rc.left,t.rc.top,t.rc.right,t.rc.bottom);
        SetDCBrushColor(hdc,dark(t.color));
        Rectangle(hdc,(int)t.x+2,(int)t.y+2,(int)t.x+CELL-2,(int)t.y+8);
        Rectangle(hdc,(int)t.x+2,(int)t.y+CELL-8,(int)t.x+CELL-2,(int)t.y+CELL-2);
        HPEN pen=CreatePen(PS_SOLID,6,RGB(255,255,255));
        SelectObject(hdc,pen);
        MoveToEx(hdc,(int)t.x+CELL/2,(int)t.y+CELL/2,0);
        LineTo(hdc,(int)t.x+CELL/2+t.d.x*18,(int)t.y+CELL/2+t.d.y*18);
        DeleteObject(pen);
        SelectObject(hdc,GetStockObject(DC_BRUSH)); SetDCBrushColor(hdc,RGB(255,255,255));
        Ellipse(hdc,(int)t.x+CELL/2-6,(int)t.y+CELL/2-6,(int)t.x+CELL/2+6,(int)t.y+CELL/2+6);
    }

    void draw_bullet(HDC hdc, Bullet* b) {
        if (!b->alive) return;
        SelectObject(hdc,GetStockObject(DC_BRUSH)); SetDCBrushColor(hdc,RGB(255,240,80));
        RECT r=b->rc(); Ellipse(hdc,r.left,r.top,r.right,r.bottom);
    }

    void draw_base(HDC hdc) {
        auto c=base->alive?RGB(255,215,0):RGB(80,80,80);
        HPEN pen=CreatePen(PS_SOLID,2,c);
        SelectObject(hdc,pen); SelectObject(hdc,GetStockObject(NULL_BRUSH));
        Rectangle(hdc,base->rc.left,base->rc.top,base->rc.right,base->rc.bottom);
        DeleteObject(pen);
        pen=CreatePen(PS_SOLID,3,RGB(255,255,255));
        SelectObject(hdc,pen);
        int cx=base->rc.left+CELL-5, by=base->rc.top+(base->rc.bottom-base->rc.top)*3/4, ty=base->rc.top+CELL/2;
        MoveToEx(hdc,cx,by,0); LineTo(hdc,cx,ty); DeleteObject(pen);
        if (base->alive) {
            POINT p[3]={{cx,ty},{cx+18,ty+10},{cx,ty+20}};
            SelectObject(hdc,GetStockObject(DC_BRUSH)); SetDCBrushColor(hdc,RGB(255,50,50));
            Polygon(hdc,p,3);
        }
    }

    void draw_hud(HDC hdc) {
        wchar_t buf[64];
        SetTextColor(hdc,RGB(255,255,255)); SetBkMode(hdc,TRANSPARENT);
        wsprintfW(buf,L"得分: %d",score); TextOutW(hdc,10,10,buf,(int)wcslen(buf));
        wsprintfW(buf,L"生命: %d",lives); TextOutW(hdc,10,38,buf,(int)wcslen(buf));
        int cnt=0; for (auto& t:tanks) if (t.owner==1 && t.alive) cnt++;
        wsprintfW(buf,L"剩余敌人: %d",max(0,MAX_SPAWN-spawned)+cnt);
        TextOutW(hdc,10,66,buf,(int)wcslen(buf));
    }

    void draw_menu(HDC hdc) {
        RECT cl={0,0,SW,SH};
        FillRect(hdc,&cl,(HBRUSH)GetStockObject(BLACK_BRUSH));
        SetBkMode(hdc,TRANSPARENT);
        HFONT f=CreateFontW(48,0,0,0,FW_BOLD,0,0,0,DEFAULT_CHARSET,0,0,0,0,L"SimHei");
        SelectObject(hdc,f); SetTextColor(hdc,RGB(50,180,50));
        RECT r={0,100,SW,160}; DrawTextW(hdc,L"坦  克  大  战",-1,&r,DT_CENTER);
        DeleteObject(f);
        f=CreateFontW(22,0,0,0,FW_NORMAL,0,0,0,DEFAULT_CHARSET,0,0,0,0,L"SimHei");
        SelectObject(hdc,f); SetTextColor(hdc,RGB(180,180,180));
        LPCWSTR lines[]={L"移动: 方向键 / WASD",L"开火: 空格",L"",L"消灭所有敌人，保护基地",L"",L"按 ENTER 开始游戏"};
        int y=280;
        for (auto l:lines) { if (!l[0]){y+=10;continue;} r={0,y,SW,y+30}; DrawTextW(hdc,l,-1,&r,DT_CENTER); y+=35; }
        DeleteObject(f);
    }

    void draw_overlay(HDC hdc) {
        RECT r={0,SH/2-80,SW,SH/2+80};
        FillRect(hdc,&r,(HBRUSH)GetStockObject(BLACK_BRUSH));
        SetBkMode(hdc,TRANSPARENT);
        HFONT f=CreateFontW(48,0,0,0,FW_BOLD,0,0,0,DEFAULT_CHARSET,0,0,0,0,L"SimHei");
        SelectObject(hdc,f);
        SetTextColor(hdc,win?RGB(60,200,60):RGB(220,50,50));
        RECT t={0,SH/2-60,SW,SH/2-10};
        DrawTextW(hdc,win?L"胜  利  ！":L"游  戏  结  束",-1,&t,DT_CENTER);
        DeleteObject(f);
        f=CreateFontW(22,0,0,0,FW_NORMAL,0,0,0,DEFAULT_CHARSET,0,0,0,0,L"SimHei");
        SelectObject(hdc,f);
        SetTextColor(hdc,RGB(200,200,200));
        t={0,SH/2+10,SW,SH/2+40};
        DrawTextW(hdc,L"按 R 重新开始    按 ESC 退出",-1,&t,DT_CENTER);
        DeleteObject(f);
    }
};

Game g;

// ============================================================
// 窗口过程
// ============================================================

LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM w, LPARAM l) {
    switch (msg) {
    case WM_ERASEBKGND: return 1; // 阻止背景擦除，配合双缓冲消除闪烁
    case WM_CREATE: SetTimer(hwnd,1,1000/FPS,0); return 0;
    case WM_TIMER:
        g.update();
        InvalidateRect(hwnd,0,FALSE);
        return 0;
    case WM_PAINT: {
        PAINTSTRUCT ps;
        HDC hdc=BeginPaint(hwnd,&ps);
        g.draw(hdc);
        EndPaint(hwnd,&ps);
        return 0;
    }
    case WM_KEYDOWN:
        if (w==VK_ESCAPE) PostQuitMessage(0);
        if (w==VK_RETURN && g.state==Game::MENU) { g.reset(); g.state=Game::PLAY; }
        return 0;
    case WM_DESTROY: KillTimer(hwnd,1); PostQuitMessage(0); return 0;
    }
    return DefWindowProcW(hwnd,msg,w,l);
}

// ============================================================
// 入口
// ============================================================

int WINAPI WinMain(HINSTANCE h, HINSTANCE, LPSTR, int n) {
    srand((unsigned)time(0));
    WNDCLASSA wc={}; wc.lpfnWndProc=WndProc; wc.hInstance=h; wc.hCursor=LoadCursor(0,IDC_ARROW); wc.lpszClassName="TankWindow";
    RegisterClassA(&wc);
    RECT wr={0,0,SW,SH}; AdjustWindowRect(&wr,WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX,0);
    HWND hwnd=CreateWindowExA(0,"TankWindow","坦克大战",WS_CAPTION|WS_SYSMENU|WS_MINIMIZEBOX,
        CW_USEDEFAULT,CW_USEDEFAULT,wr.right-wr.left,wr.bottom-wr.top,0,0,h,0);
    if (!hwnd) return 1;
    g.hwnd=hwnd; g.reset();
    ShowWindow(hwnd,n);
    MSG msg={}; while (GetMessage(&msg,0,0,0)) { TranslateMessage(&msg); DispatchMessage(&msg); }
    return 0;
}
