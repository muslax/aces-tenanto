import bcrypt from 'bcryptjs';

import { API } from "config/api";
import { DB } from "config/db";
import { ObjectID } from "mongodb";
import { connect } from "./database";
import { createRandomPassword } from "./utils";

export async function saveNewUser(req, res) {
  try {
    const apiUser = req.session.get("user");
    const { fullname, email, username } = req.body;
    const { password, hashed_password, xfpwd } = createRandomPassword();
    const id = ObjectID().toString();
    const { dba } = await connect();
    const rs = await dba.collection(DB.USERS).insertOne({
      _id: id,
      lid: apiUser.license._id,
      fullname: fullname,
      username: username,
      email: email,
      // licenseOwner: false,
      verified: false,
      disabled: false,
      deleted: false,
      gender: null,
      phone: null,
      roles: [],
      xfpwd: xfpwd,
      hashed_password: hashed_password,
      creator: apiUser.username,
      created: new Date().getTime(),
      updated: null,
    })

    if (rs) {
      return res.json({
        _id: id,
        lid: apiUser.licenseOwner,
        fullname: fullname,
        email: email,
        username: username,
        password: password,
      });
    }
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function disableUser(req, res) {
  try {
    const id = req.body.id;
    const { dba } = await connect();
    const rs = await dba.collection(DB.USERS).findOneAndUpdate(
      { _id: id },
      { $set: { disabled: true, updated: new Date().getTime() }}
    )

    if (rs) {
      return res.json({ message: 'User disabled' });
    } else {
      return res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function activateUser(req, res) {
  try {
    const id = req.body.id;
    const { dba } = await connect();
    const rs = await dba.collection(DB.USERS).findOneAndUpdate(
      { _id: id },
      { $set: { disabled: false, updated: new Date().getTime() }}
    )

    if (rs) {
      return res.json({ message: 'User reactivated' });
    } else {
      return res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function deleteUser(req, res) {
  try {
    const id = req.body.id;
    const { dba } = await connect();
    const rs = await dba.collection(DB.USERS).findOneAndUpdate(
      { _id: id },
      { $set: { disabled: false, deleted: true, updated: new Date().getTime() }}
    )

    if (rs) {
      return res.json({ message: 'User deleted' });
    } else {
      return res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function resetUser(req, res) {
  try {
    const id = req.body.id;
    const { password, hashed_password, xfpwd } = createRandomPassword();

    const { dba } = await connect();
    const rs = await dba.collection(DB.USERS).findOneAndUpdate(
      { _id: id },
      { $set: {
        xfpwd: xfpwd,
        hashed_password: hashed_password,
        updated: new Date().getTime()
        }
      }
    )

    if (rs) {
      const user = rs.value;
      return res.json({
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        password: password,
      });
    } else {
      return res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function changePassword(req, res) {
  const apiUser = req.session.get("user");
  try {
    const id = apiUser._id;
    const { oldPassword, newPassowrd } = req.body;
    // console.log(oldPassword, newPassowrd);
    const { dba } = await connect();

    const user = await dba.collection(DB.USERS).findOne({ _id: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const verified = bcrypt.compareSync(oldPassword, user.hashed_password)
    if (!verified) return res.json({
      ok: false,
      message: "Anda memasukkan password yang salah."
    })

    const saltRounds = 5;
    const hash = bcrypt.hashSync(newPassowrd, saltRounds)
    const rs = await dba.collection(DB.USERS).findOneAndUpdate(
      { _id: id},
      { $set : {
        hashed_password: hash,
        updated: new Date().getTime()
        }
      },
    )
    if (rs) {
      return res.json({
        ok: true,
        message: "Berhasil mengganti password."
      })
    } else {
      return res.status(500).json({ message: 'Internal server error' })
    }
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function saveProject(req, res) {
  try {
    const apiUser = req.session.get("user");
    const lid = apiUser.license._id;
    const { dba, client } = await connect();
    const session = client.startSession();

    await session.withTransaction(async () => {
      const cid = ObjectID().toString();

      const client = await dba.collection(DB.CLIENTS).insertOne({
        _id: cid,
        lid: lid,
        name: req.body.clientName,
        address: req.body.clientAddress,
        city: req.body.clientCity,
        phone: null,
        contacts: [],
        creator: apiUser.username,
        created: new Date().getTime(),
        updated: null,
      });

      const pid = ObjectID().toString();
      const project = await dba.collection(DB.PROJECTS).insertOne({
        _id: pid,
        lid: lid,
        cid: cid,
        status: null,
        batchMode: req.body.batchMode,
        title: req.body.title,
        fullTitle: req.body.fullTitle,
        description: req.body.description,
        contractDate: req.body.contractDate,
        admin: apiUser.username,
        contacts: [],
        creator: apiUser.username,
        created: new Date().getTime(),
        updated: null,
      });

      const bid = ObjectID().toString();
      const batch = await dba.collection(DB.BATCHES).insertOne({
        _id: bid,
        pid: pid,
        title: 'Default',
        token: null,
        modules: [],
        date1: null,
        date2: null,
        disabled: false,
        creator: 'system',
        created: new Date().getTime(),
        updated: null,
      });

      return res.json({ message: 'OK' });
    })
    //
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function saveClientProject(req, res) {
  try {
    const apiUser = req.session.get("user");
    const lid = apiUser.license._id;
    const { dba, client } = await connect();
    const session = client.startSession();

    await session.withTransaction(async () => {
      const pid = ObjectID().toString();
      await dba.collection(DB.PROJECTS).insertOne({
        _id: pid,
        lid:lid,
        cid: req.body.cid,
        status: null,
        batchMode: req.body.batchMode,
        title: req.body.title,
        fullTitle: req.body.fullTitle,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        admin: apiUser.username,
        contacts: [],
        creator: apiUser.username,
        created: new Date().getTime(),
        updated: null,
      });

      const bid = ObjectID().toString();
      await dba.collection(DB.BATCHES).insertOne({
        _id: bid,
        pid: pid,
        title: 'Default',
        token: null,
        modules: [],
        date1: null,
        date2: null,
        disabled: false,
        creator: 'system',
        created: new Date().getTime(),
        updated: null,
      });

      return res.json({ message: 'OK' });
    })
    //
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function changeProjectAdmin(req, res) {
  try {
    const apiUser = req.session.get("user");
    const { dba } = await connect();
    const { id, admin: username } = req.body;

    const rs = await dba.collection(DB.PROJECTS).findOneAndUpdate(
      { _id: id },
      { $set: {
        admin: username,
        updated: new Date().getTime()
      }}
    )

    if (rs) {
      return res.json({ message: 'Admin changed' });
    } else {
      return res.status(404).json({ message: 'Project not found' })
    }
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function updateProject(req, res) {
  try {
    const { dba } = await connect();
    const { id, title, description, contractDate, admin } = req.body;

    const rs = await dba.collection(DB.PROJECTS).findOneAndUpdate(
      { _id: id },
      { $set: {
        title: title,
        description: description,
        contractDate: contractDate,
        admin: admin,
        updated: new Date().getTime()
      }}
    )

    if (rs) {
      return res.json({ message: 'Project updated' });
    } else {
      return res.status(404).json({ message: 'Project not found' })
    }
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function saveNewBatch(req, res) {
  try {
    const apiUser = req.session.get("user");
    const { pid, title, date } = req.body;
    const id = ObjectID().toString();
    const { dba } = await connect();
    const rs = await dba.collection(DB.BATCHES).insertOne({
      _id: id,
      pid: pid,
      title: title,
      token: null,
      modules: [],
      date1: date,
      date2: null,
      protected: false,
      disabled: false,
      creator: apiUser.username,
      created: new Date().getTime(),
      updated: null,
    })

    return res.json({ message: 'OK' });
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function updateBatch(req, res) {
  try {
    const { dba } = await connect();
    const { id, title, date1 } = req.body;

    const rs = await dba.collection(DB.BATCHES).findOneAndUpdate(
      { _id: id },
      { $set: {
        title: title,
        date1: date1,
        updated: new Date().getTime()
      }}
    )

    if (rs) {
      return res.json({ message: 'Batch updated' });
    } else {
      return res.status(404).json({ message: 'Project not found' })
    }
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function deleteBatch(req, res) {
  try {
    const id = req.body.id;
    const { dba } = await connect();
    const rs = await dba.collection(DB.BATCHES).findOneAndDelete({ _id: id });

    if (rs) {
      return res.json({ message: 'Batch deleted' });
    } else {
      return res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export async function CHANGE_ME(req, res) {
  try {
    const apiUser = req.session.get("user");
    const { dba } = await connect();

  } catch (error) {
    return res.status(error.status || 500).end(error.message)
  }
}

export const MUTATION = {};

MUTATION[API.POST.NEW_USER] = saveNewUser;
MUTATION[API.POST.DISABLE_USER] = disableUser;
MUTATION[API.POST.ACTIVATE_USER] = activateUser;
MUTATION[API.POST.DELETE_USER] = deleteUser;
MUTATION[API.POST.RESET_USER] = resetUser;
MUTATION[API.POST.CHANGE_PASSWORD] = changePassword;

MUTATION[API.POST.SAVE_PROJECT] = saveProject;
MUTATION[API.POST.SAVE_CLIENT_PROJECT] = saveClientProject;
MUTATION[API.POST.CHANGE_PROJECT_ADMIN] = changeProjectAdmin;
MUTATION[API.POST.UPDATE_PROJECT] = updateProject;
MUTATION[API.POST.SAVE_NEW_BATCH] = saveNewBatch;
MUTATION[API.POST.UPDATE_BATCH] = updateBatch;
MUTATION[API.POST.DELETE_BATCH] = deleteBatch;
