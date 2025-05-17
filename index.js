const express = require('express');
const app = express();

const PORT = 5000 || process.env.PORT;
const HOST = '127.0.0.1';

const connection = require('./config/db');

app.use(express.static('public/'));
app.use(express.urlencoded({ extended: true }));

var multer = require('multer')



const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => {


        //store unique file name using current time i.e Date.now()
        cb(null, Date.now() + file.originalname);

    }
})

const upload = multer({ storage: storage })


app.get('/', (req, res) => {
     res.render('home.ejs');
});


app.get('/allApplications', async (req, res) => {
  try {
    const [Applications] = await connection.execute('select *from applications');
    const obj={ data: Applications }
    res.render('allApplications.ejs', obj);
  } catch (err) {
    console.error(err);
    res.send('Error fetching applicants');
  }
});


app.get('/apply', (req, res) => {
    res.render('apply.ejs');
});


app.post('/saveform',upload.single('resume'), async (req, res) => {
    try {
        const { name, email, pnumber, position,} = req.body;

        const resume = req.file.filename;
        const sql = `INSERT INTO applications (full_name, email, phone, position_applied, resume) VALUES  ('${name}','${email}','${pnumber}','${position}','${resume}')`;
        await connection.execute(sql);
      
        res.redirect('/allApplications');
    } catch (err) {
        console.log(err);
        res.send("Failed to apply for the job");
    }
});


app.get('/allApplications/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        const [result] = await connection.execute(`select * from applications WHERE id = ${id}`);
        res.render('edit.ejs', { applicant: result[0] });
    } catch (err) {
        console.log(err);
        res.send("Failed to fetch applicant data");
    }
});


app.post('/updateForm', upload.single('resume'), async (req, res) => {
    try {
        const { name, email, pnumber, position, id } = req.body;

        let sql, params;

        if (req.file) {
            const resume = req.file.filename;
            sql = `UPDATE applications 
                   SET full_name = ?, email = ?, phone = ?, position_applied = ?, resume = ? 
                   WHERE id = ?`;
            params = [name, email, pnumber, position, resume, id];
        } else {
            sql = `UPDATE applications 
                   SET full_name = ?, email = ?, phone = ?, position_applied = ? 
                   WHERE id = ?`;
            params = [name, email, pnumber, position, id];
        }

        await connection.execute(sql, params);
        res.redirect('/allApplications');
    } catch (err) {
        console.error(err);
        res.send("Failed to update applicant");
    }
});



app.get('/allApplications/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await connection.execute(`delete from applications WHERE id ='${id}' `);
        res.redirect('/allApplications');
    } catch (err) {
        console.log(err);
        res.send("Failed to delete Applicant");
    }
});


app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});



